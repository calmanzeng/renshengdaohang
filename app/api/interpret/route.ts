/**
 * /api/interpret — 命盘解读 API
 * ChatPanel 和 InsightPanel 调用的流式解读接口
 */
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chart, messages } = body;

    const lastUserMsg = messages?.filter((m: any) => m.role === 'user')?.pop()?.content || '';
    const deepseekKey = process.env.DEEPSEEK_API_KEY || '';
    const isValidKey = deepseekKey.startsWith('sk-') && deepseekKey.length > 15;

    // ── 构建系统提示 ──
    const chartSummary = chart ? buildChartContext(chart) : '';

    const systemPrompt = `你是精通倪海夏《天纪》体系的紫微斗数命理师，用通俗易懂的语言为用户解读命盘。

${chartSummary}

解读原则：
1. 先说好的方面，再说需要注意的方面
2. 用比喻和白话解释，少用术语
3. 给出具体的、可操作的建议
4. 保持温和、鼓励的语气`;

    if (!isValidKey) {
      // 无 API Key 时返回模拟解读
      const mockResponse = getMockInterpretation(lastUserMsg);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"text":"${mockResponse}"},"finish_reason":"stop"}]}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });
    }

    // ── DeepSeek API 调用 ──
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).slice(-8).map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      return Response.json({ error: 'AI 服务暂时不可用' }, { status: 502 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) { controller.close(); return; }
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n').filter(l => l.trim())) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') { controller.enqueue(encoder.encode('data: [DONE]\n\n')); break; }
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
          }
        } catch (e) {
          console.error('Stream error:', e);
        } finally {
          reader?.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  } catch (err) {
    console.error('Interpret API error:', err);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// ─── 命盘上下文构建 ──
function buildChartContext(chart: any): string {
  if (!chart || !chart.palaces) return '';
  const lines: string[] = ['【用户命盘信息】'];
  for (const p of chart.palaces) {
    const majorStars = (p.stars || []).filter((s: any) => s.type === 'major');
    const allStars = (p.stars || []).map((s: any) => {
      const sihua = s.siHua ? `化${s.siHua}` : '';
      const brightness = s.brightness ? `(${s.brightness})` : '';
      return `${s.name}${sihua}${brightness}`;
    }).join(', ');
    const empty = (p.isEmpty || !majorStars.length) ? '（空宫）' : '';
    lines.push(`${p.name}：${allStars}${empty}`);
  }
  if (chart.daXian) {
    lines.push(`当前大限：${chart.daXian.palaceName || ''}宫（${chart.daXian.startAge || ''}-${chart.daXian.endAge || ''}岁）`);
  }
  return lines.join('\n');
}

// ─── 无 API Key 时的模拟回复 ──
function getMockInterpretation(question: string): string {
  if (question.includes('感情') || question.includes('婚姻')) {
    return '从命盘来看，夫妻宫的星曜配置显示你在感情中比较注重精神层面的交流。紫微斗数认为，夫妻宫的三方四正（官禄宫、迁移宫、福德宫）共同决定了感情模式。建议你多关注与伴侣的沟通方式，学会换位思考。如需更精准的分析，请在 .env.local 中配置 DEEPSEEK_API_KEY。';
  }
  if (question.includes('事业') || question.includes('工作')) {
    return '根据官禄宫的星曜组合，你适合从事需要独立思考和创造力的工作。命宫主星决定了你的工作风格，而官禄宫的三方四正则揭示了事业发展的方向。当前大限的宫位也提示了这十年的职业重心。建议结合流年运势做具体规划。';
  }
  if (question.includes('财运') || question.includes('财富')) {
    return '财帛宫的星曜配置显示你的财运有稳定的基础。紫微斗数中，财帛宫不仅看赚钱能力，还要看田宅宫（守财能力）和命宫（对财富的态度）。化禄入财帛宫是财运亨通的信号，但化忌入财帛宫则提示需谨慎理财。';
  }
  return '感谢你的提问。从命盘的整体格局来看，你的命宫主星显示了独特的性格底色。需结合三方四正和当前大限、流年才能给出更精准的分析。建议使用「命格」「感情」「事业」「财运」「健康」等预设话题获取详细解读。如需启用 AI 解读，请在 .env.local 中配置 DEEPSEEK_API_KEY。';
}

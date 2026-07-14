"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// 合约 ABI 和地址
const CONTRACT_ABI = [
  "function mintDestiny(uint16 birthYear, uint8 birthMonth, uint8 birthDay, uint8 birthHour, uint8 gender, string calldata palaceHash) external returns (uint256)",
  "function hasMinted(address user) external view returns (bool)",
  "function getTokenId(address user) external view returns (uint256)",
  "function getDestiny(uint256 tokenId) external view returns (tuple(uint16 birthYear, uint8 birthMonth, uint8 birthDay, uint8 birthHour, uint8 gender, string palaceHash, uint256 mintedAt))",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function totalSupply() external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "event DestinyMinted(uint256 indexed tokenId, address indexed owner, uint16 birthYear, uint8 birthMonth, uint8 birthDay, uint8 birthHour, uint8 gender, string palaceHash)",
];

// Monad Mainnet 配置
const MONAD_MAINNET = {
  chainId: "0x8F", // 143
  chainName: "Monad",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: ["https://rpc.monad.xyz"],
  blockExplorerUrls: ["https://monadvision.com"],
};

interface DestinyNFTProps {
  /** 出生年 */
  birthYear: number;
  /** 出生月 */
  birthMonth: number;
  /** 出生日 */
  birthDay: number;
  /** 出生时辰 (0=早子时, 1-11=丑-亥, 12=晚子时) */
  birthHour: number;
  /** 性别 (1=男, 2=女) */
  gender: number;
  /** 命盘数据哈希 (IPFS/Arweave CID) */
  palaceHash: string;
  /** 合约地址 (部署后填写) */
  contractAddress: string;
  /** 禁用状态 (例如排盘还没完成时) */
  disabled?: boolean;
}

export default function DestinyNFTMinter({
  birthYear,
  birthMonth,
  birthDay,
  birthHour,
  gender,
  palaceHash,
  contractAddress,
  disabled = false,
}: DestinyNFTProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "connect-wallet" | "switch-chain" | "minting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [alreadyMinted, setAlreadyMinted] = useState(false);

  // 检查是否已铸造
  const checkMinted = useCallback(async (addr: string, contract: ethers.Contract) => {
    try {
      const minted = await contract.hasMinted(addr);
      setAlreadyMinted(minted);
      if (minted) {
        const tid = await contract.getTokenId(addr);
        setTokenId(Number(tid));
      }
    } catch {
      // ignore
    }
  }, []);

  // 初始化 provider
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const p = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(p);
      // 检查是否已连接
      p.send("eth_requestAccounts", []).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (contractAddress) {
            const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, p);
            checkMinted(accounts[0], contract);
          }
        }
      });
    }
  }, [contractAddress, checkMinted]);

  // 连接钱包
  const connectWallet = async () => {
    if (!provider) {
      setMessage("请安装 MetaMask 钱包");
      setStatus("error");
      return;
    }
    try {
      setStatus("connect-wallet");
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      
      // 检查是否在 Monad Testnet
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 143) {
        await switchToMonad();
      }
      
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      await checkMinted(accounts[0], contract);
      setStatus("idle");
      setMessage("钱包已连接 ✓");
    } catch (e: any) {
      setMessage(e.message || "钱包连接失败");
      setStatus("error");
    }
  };

  // 切换到 Monad Testnet
  const switchToMonad = async () => {
    try {
      setStatus("switch-chain");
      await provider!.send("wallet_switchEthereumChain", [{ chainId: MONAD_MAINNET.chainId }]);
    } catch (e: any) {
      // 如果链不存在，尝试添加
      if (e.code === 4902) {
        await provider!.send("wallet_addEthereumChain", [MONAD_MAINNET]);
      } else {
        throw e;
      }
    }
  };

  // 铸造命盘 NFT
  const mintDestiny = async () => {
    if (!provider || !account || !contractAddress) return;
    
    try {
      setStatus("minting");
      setLoading(true);
      setMessage("正在铸造您的命盘 NFT... 请确认交易");
      
      // 确保在 Monad Testnet
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 143) {
        await switchToMonad();
      }
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      // 调用 mintDestiny
      const tx = await contract.mintDestiny(
        birthYear,
        birthMonth,
        birthDay,
        birthHour,
        gender,
        palaceHash
      );
      
      setMessage("交易已提交，等待链上确认...");
      await tx.wait();
      
      // 获取 token ID
      const tid = await contract.getTokenId(account);
      setTokenId(Number(tid));
      setAlreadyMinted(true);
      setStatus("success");
      setMessage(`🎉 命盘 NFT 铸造成功！Token ID: ${Number(tid)}`);
    } catch (e: any) {
      console.error("Mint error:", e);
      if (e.code === "ACTION_REJECTED" || e.code === 4001) {
        setMessage("用户取消了交易");
      } else if (e.message?.includes("AlreadyMinted")) {
        setMessage("您已经铸造过命盘了");
      } else {
        setMessage(e.reason || e.message || "铸造失败");
      }
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">🔮 将命盘上链存证</h3>
      <p className="text-sm text-muted-foreground mb-4">
        将您的命盘数据铸造为不可转移的 Soulbound NFT，永久存储于 Monad 区块链
      </p>
      
      {/* 状态显示 */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          status === "success" ? "bg-green-50 text-green-700 border border-green-200" :
          status === "error" ? "bg-red-50 text-red-700 border border-red-200" :
          "bg-blue-50 text-blue-700 border border-blue-200"
        }`}>
          {message}
        </div>
      )}
      
      {/* 已铸造显示 */}
      {alreadyMinted && tokenId ? (
        <div className="flex flex-col gap-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-700 font-medium">✅ 您的命盘已上链存证</p>
            <p className="text-sm text-green-600 mt-1">Token ID: #{tokenId}</p>
            <a
              href={`https://monadvision.com/token/${contractAddress}?a=${tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              在区块链浏览器查看 ↗
            </a>
          </div>
        </div>
      ) : !account ? (
        /* 未连接钱包 */
        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          🦊 连接 MetaMask 钱包
        </button>
      ) : (
        /* 已连接钱包，未铸造 */
        <div className="flex flex-col gap-3">
          <div className="text-xs text-muted-foreground truncate">
            钱包: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
          <button
            onClick={mintDestiny}
            disabled={disabled || loading || !contractAddress}
            className="w-full py-2.5 px-4 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "⏳ 铸造中..." : "🔮 铸造命盘 NFT"}
          </button>
          {disabled && (
            <p className="text-xs text-amber-600">请先完成排盘后再铸造</p>
          )}
        </div>
      )}
      
      {/* 信息提示 */}
      <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
        <p>⚡ 基于 Monad 区块链 (Testnet) · Soulbound 不可转移</p>
        <p>💎 一个地址可铸造多个命盘 · 可随时销毁</p>
        <p>🛡️ 命盘数据经哈希后上链，永久存证</p>
      </div>
    </div>
  );
}

# DestinySBT 部署指南 — Monad Mainnet

## 准备工作
1. **安装 MetaMask** 浏览器插件
2. **添加 Monad Mainnet**:
   - RPC: https://rpc.monad.xyz
   - Chain ID: 143
   - 代币: MON
   - 浏览器: https://monadvision.com
3. **获取MON（主网需要真实 MON）**: Monad 官方交易所购买/跨链桥
4. **导出私钥**: 从 MetaMask 导出

## 部署方式 A：Remix IDE（推荐）
1. 打开 https://remix.ethereum.org/
2. 新建 DestinySBT.sol，粘贴合约源码
3. 编译: Solidity 0.8.20 + Optimizer(200) + Enable IR
4. 部署: Injected Provider → MetaMask → Deploy
5. 记录合约地址

## 部署方式 B：Hardhat CLI
1. `set MONAD_PRIVATE_KEY=你的私钥`
2. `npx hardhat run scripts/deploy.mjs --network monad-testnet`

## 部署后
1. 将合约地址填入 `app/chart/page.tsx` 的 `DESTINY_CONTRACT`
2. 重启: `npm run dev`
3. 用户即可排盘后铸造命盘 NFT

import { getTokensInProtocolsInternal } from "./getTokenInProtocols";

describe("getTokensInProtocolsInternal", () => {
  it("returns base-chain token usage without changing token-level totals", async () => {
    const protocol = { name: "Test Protocol", category: "Lending" } as any;

    const result = await getTokensInProtocolsInternal("USDC", {
      protocolList: [protocol],
      getLastHourlyTokensUsd: async () => ({
        PK: "hourlyUsdTokensTvl#123",
        SK: 1777766400,
        tvl: {
          USDC: 150,
          WETH: 50,
        },
        ethereum: {
          USDC: 100,
          WETH: 50,
        },
        arbitrum: {
          USDC: 50,
        },
        borrowed: {
          USDC: -25,
        },
        ownTokens: {
          USDC: 999,
        },
        "ethereum-borrowed": {
          USDC: -25,
        },
      }),
      protocolHasMisrepresentedTokens: async () => false,
    });

    expect(result).toEqual([
      {
        name: "Test Protocol",
        category: "Lending",
        amountUsd: {
          USDC: 150,
        },
        amountUsdByChain: {
          ethereum: 100,
          arbitrum: 50,
        },
        misrepresentedTokens: false,
      },
    ]);
  });

  it("aggregates multiple matching token keys inside each chain bucket", async () => {
    const protocol = { name: "Test Protocol", category: "DEX" } as any;

    const result = await getTokensInProtocolsInternal("USD", {
      protocolList: [protocol],
      getLastHourlyTokensUsd: async () => ({
        PK: "hourlyUsdTokensTvl#456",
        SK: 1777766400,
        tvl: {
          USDC: 100,
          USDT: 25,
        },
        ethereum: {
          USDC: 70,
          USDT: 5,
        },
        base: {
          USDC: 30,
          USDT: 20,
          WETH: 20,
        },
        borrowed: {
          USDT: 999,
        },
        "ethereum-borrowed": {
          USDT: 20,
        },
      }),
      protocolHasMisrepresentedTokens: async () => false,
    });

    expect(result[0]).toMatchObject({
      amountUsd: {
        USDC: 100,
        USDT: 25,
      },
      amountUsdByChain: {
        ethereum: 75,
        base: 50,
      },
    });
  });
});

import { Address } from "viem";
export declare const useBalance: (address: Address | undefined) => import("@tanstack/react-query").UseQueryResult<bigint, Error>;
export declare const useAllowance: (address: Address | undefined) => import("@tanstack/react-query").UseQueryResult<bigint, Error>;
export declare const useIncreaseAllowance: () => import("@tanstack/react-query").UseMutationResult<`0x${string}`, any, void, unknown>;

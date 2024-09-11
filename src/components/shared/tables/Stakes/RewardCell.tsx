import { useStakeReward } from "@/src/lib/query/conservative";
import { ZeroAddress, valueToNumber } from "@betfinio/abi";
import { Bet } from "@betfinio/ui/dist/icons";
import { type CellContext } from "@tanstack/react-table";
import { BetValue } from "betfinio_app/BetValue";
import type { Stake } from "betfinio_app/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "betfinio_app/tooltip";
import { Loader } from "lucide-react";
import { Address } from "viem";
import { useAccount } from "wagmi";

export const RewardCell = (props: CellContext<Stake, bigint | undefined>) => {
  const pool = props.row.getValue("pool") as Address;
  const hash = props.row.original.hash as Address;

  const { address = ZeroAddress } = useAccount();
  const { data:reward=0n, isLoading } = useStakeReward(address, pool, hash);

  const poolReward = props.getValue();
  const poolAmount = Number(props.row.getValue("amount") as bigint);


  const rewardDiff = reward-(poolReward??0n) ;
  const percentage = (Number(rewardDiff*100n)/ poolAmount);




  if (isLoading) return <Loader className={"h-5 w-5 animate-spin"} />;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <div className={"text-green-400 font-bold"}>
          <TooltipTrigger>
            <span>{percentage.toFixed(2)}%</span>
          </TooltipTrigger>
        </div>
        <TooltipContent className={"text-white bg-black"}>
          Claimed rewards:
		  {/* <BetValue value={rewardDiff}/> */}
          <div className={"text-yellow-400 font-bold flex items-center gap-1 justify-center"}>
            {valueToNumber(rewardDiff).toLocaleString()} <Bet />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

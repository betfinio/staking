import SingleInfo, {
  type SingleIngoProps,
} from '@/src/components/shared/SingleInfo.tsx';
import type { FC } from 'react';

export interface SharedGameBlockProps {
  games: SingleIngoProps[];
}

const SharedGameBlock: FC<SharedGameBlockProps> = ({ games }) => {
  return (
    <>
      <div
        className={
          'w-full grid-cols-1 hidden md:grid md:grid-cols-3 gap-2 lg:gap-4 whitespace-nowrap '
        }
      >
        {games.map((game, i) => (
          <SingleInfo key={i} {...game} />
        ))}
      </div>
      <div
        className={
          'bg-primaryLight md:px-4 rounded-lg w-full grid md:hidden grid-cols-3 gap-2 text-sm'
        }
      >
        {games.map((game, i) => (
          <SingleInfo key={i} {...game} />
        ))}
      </div>
    </>
  );
};

export default SharedGameBlock;

/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
import { useEffect, useRef, useState, useTransition } from "react";

type Action<TArgs, TResult> = (args: TArgs) => Promise<TResult>;

export function useServerAction<TArgs, TResult>(
  action: Action<TArgs, TResult>,
  onFinished: ((result: TResult) => void) | null = null,
) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<TResult | null>(null);
  const [finished, setFinished] = useState(false);
  const resolver = useRef<((value: TResult) => void) | null>(null);

  const resetState = () => {
    setResult(null);
    setFinished(false);
  };

  useEffect(() => {
    if (finished) {
      if (onFinished) {
        onFinished(result!);
      }
      resolver.current?.(result!);
      resetState(); // Reset the state after the action finishes
    }
  }, [finished, onFinished, result]);

  const runAction = async (args: TArgs) => {
    startTransition(async () => {
      const data = await action(args);
      setResult(data);
      setFinished(true);
    });

    return new Promise<TResult>((resolve, reject) => {
      resolver.current = resolve;
    });
  };

  return [runAction, isPending] as const;
}

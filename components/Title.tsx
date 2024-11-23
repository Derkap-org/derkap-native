import { cn } from '../lib/utils';
import { Text, TextProps } from 'react-native';

interface titleProps extends TextProps {
  text: string;
}

export default function Title({ text, className, ...props }: titleProps) {
  return (
    <Text
      {...props}
      className={cn('font-champ text-[32px] text-center text-custom-black', className)}
    >
      {text}
    </Text>
  );
}

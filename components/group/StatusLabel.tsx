import { View, Text } from 'react-native'
import { Database } from '../../types/supabase'
import { getStatusLabel, cn } from '../../lib/utils'
interface StatusLabelProps {
    challengeStatus?: Database['public']['Tables']['challenge']['Row']['status'];
}

export default function StatusLabel({ challengeStatus }: StatusLabelProps) {
    const statusColorMap: {
        [key in Database['public']['Tables']['challenge']['Row']['status']]: string;
      } = {
        posting: 'bg-orange-400',
        voting: 'bg-yellow-400',
        ended: 'bg-gray-400',
      };

      //todo: add skeleton
      if (!challengeStatus) return <View className="w-20 h-5 bg-gray-600" />;

    return (
        <View
      className={cn(
        'rounded px-2.5 py-0.5 text-xs font-semibold text-white w-fit',
        statusColorMap[challengeStatus],
      )}
    >
      <Text className="text-center">
        {getStatusLabel({ status: challengeStatus })}
      </Text>
    </View>
    )
}
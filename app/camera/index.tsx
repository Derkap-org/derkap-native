import { Link } from 'expo-router';
import Camera from '../../components/Capture';
import { Text, View } from 'react-native';
export default function CameraPage() {
  return (

    <View className='flex-1'>
      <Link href='/' className="text-center h-5">Back to home</Link>
      <Camera />
      </View>

  )
}

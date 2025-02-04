import React, { useRef, KeyboardEvent, ClipboardEvent } from "react";
import { TextInput, View } from "react-native";

interface OtpInputProps {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  length?: number;
  onComplete?: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({
  otp,
  setOtp,
  length = 6,
  onComplete,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>(new Array(length).fill(null));

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyPress = (
    index: number,
    event: { nativeEvent: { key: string } },
  ) => {
    const key = event.nativeEvent.key;

    if (key === "Backspace") {
      if (!otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);

        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
    }
  };

  return (
    <View className="flex-row justify-center gap-2">
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          maxLength={1}
          value={digit}
          onChangeText={(value) => handleChange(index, value)}
          onKeyPress={(e) => handleKeyPress(index, e)}
          keyboardType="numeric"
          className="w-10 h-10 text-xl text-center border rounded-md"
        />
      ))}
    </View>
  );
};

export default OtpInput;

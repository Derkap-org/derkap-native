export const sendNotification = async ({
  expoPushToken,
  title,
  subtitle,
  message,
  // EXPO_ACCESS_TOKEN,
}: {
  expoPushToken: string;
  title: string;
  subtitle: string;
  message: string;
  // EXPO_ACCESS_TOKEN: string;
}) => {
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${EXPO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: "default",
      title,
      subtitle,
      body: message,
      badge: 1,
    }),
  });
  //.then((res) => res.json());
};

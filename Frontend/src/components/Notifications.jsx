//fetch NOTIFICATION FROM BACKEND
export const fetchNotifications = async () => {
  try {
    const resp = await fetch("http://localhost:8000/notifications");
    const data = await resp.json();
    // console.log(data.message); // Logs the message
    return data.message; // Returns the message
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};

//POST NOTIFICATION TO BACKEND
export const postNotification = async (message) => {
  try {
    const resp = await fetch("order-management-l9mt.vercel.app/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    
    if (resp.ok) {
      console.log("Notification sent successfully!");
    } else {
      console.error("Failed to send notification:", resp.statusText);
    }
    return { success: true, message: "successfull" };
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

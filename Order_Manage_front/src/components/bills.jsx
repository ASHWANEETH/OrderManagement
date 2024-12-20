/* eslint-disable react-refresh/only-export-components */
export const fetchBills = async () => {
  try {
    const resp = await fetch("http://localhost:5174/bills");
    const data = await resp.json();
    // console.log(data[0]); // Logs the message
    return data; // Returns the message
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};

export const postBills = async (message) => {
  try {
    await fetch("http://localhost:5174/bills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message ),
    });
    return { success: true, message: "successfull" };
  } catch (error) {
    console.error("Error sending bills:", error);
  }
};


export const RemBill = async (message) => {
  console.log(message);
  try {
    await fetch("http://localhost:5174/bills",
      {
        method:"DELETE",
        headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
      
  });
  return { success: true, message: "successfull" };
  } catch (error) {
    console.error("Error deleting bill:", error);
  }
}
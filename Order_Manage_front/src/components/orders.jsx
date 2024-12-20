/* eslint-disable react-refresh/only-export-components */


//fetch orders
export const fetchOrders = async () => {
  try {
    const resp = await fetch("http://localhost:5174/orders");
    const data = await resp.json();
    // console.log(data); // Logs the message
    return data; // Returns the message
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};


//add item to order
export const AddItem = async (message) => {
  // console.log(message);
  try {
    await fetch("http://localhost:5174/orders",
      {
        method:"PUT",
        headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
      
  });
  return { success: true, message: "successfull" };
  } catch (error) {
    console.error("Error putting item:", error);
  }
}


//remove item from orders
export const RemItem = async (message) => {
  // console.log(message);
  try {
    await fetch("http://localhost:5174/orders",
      {
        method:"DELETE",
        headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
      
  });
  return { success: true, message: "successfull" };
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}
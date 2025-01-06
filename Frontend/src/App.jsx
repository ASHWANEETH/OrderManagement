/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import menu from "./components/menu.json";
// import {fetchNotifications,postNotification} from "./components/Notifications";
import {AddItem, fetchOrders,RemItem} from "./components/orders";
import {fetchBills,postBills,RemBill} from "./components/bills";


export const App = () => {
  const [role, setRole] = useState(""); // Take Order or Show Orders
  const [selectedTable, setSelectedTable] = useState(); // Current table
  const [orders, setOrders] = useState({}); // {table: [items]}
  const [ordersShow, setOrdersShow] = useState({}); // {table: [items]}
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [suggestions, setSuggestions] = useState([]); // Suggestions list
  const [bill, setBill] = useState({}); // Bill display for each table
  // const [notifications, setNotifications] = useState([" "]); // List of notifications
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [Rem, setRem] = useState(false);

  



  //fetch Notification==============================================================
  // const fetchDataNoti = async () => {
  //   try {
  //     // Fetch new notifications
  //     const data = await fetchNotifications();
  
  //     // Update notifications with the new data
  //     setNotifications((prev) => [...prev, data]);
  
  //     // Reset notifications after 3 seconds
  //     setTimeout(() => {
  //       setNotifications((prev) => prev.length > 0 ? ["📌"] : prev); // Ensure no overwriting if notifications are added during the delay
  //     }, 3000);
  //   } catch (error) {
  //     console.error("Error fetching notifications:", error);
  //   }
  // };
  



  const ShowDataOrder = async () => {
    try {
      // Step 2: Fetch all current orders
      const currentOrders = await fetchOrders();
  
      // Transform the currentOrders array into an object grouped by tableId
      const groupedOrders = currentOrders.reduce((acc, table) => {
        acc[table.tableId] = table.orders;
        return acc;
      }, {});
  
  
      // Update the state with grouped orders
      setOrdersShow(groupedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };


  //fetch Orders===================================================================
  const fetchDataOrder = async () => {
    try {
      // Step 1: Reset orders state
      // setOrders({});
  
      // Step 2: Fetch all current orders
      const currentOrders = await fetchOrders();
      console.log(currentOrders);
  
      // Step 3: Find the orders for the selected table
      const tableOrders = currentOrders.find((entry) => entry.tableId === selectedTable);
  
      // Step 4: Check if orders exist for the selected table
      if (tableOrders && tableOrders.orders) {
        const formattedOrders = tableOrders.orders.map(order => ({
          itemName: order.itemName,
          quantity: order.quantity,
          price: order.price,
        }));
  
        // Step 5: Update the state with the new orders
        setOrders((prev) => ({
          ...prev,
          [selectedTable]: formattedOrders,
        }));

        console.log(formattedOrders);
        
      } else {
        console.warn(`No orders found for table ID: ${selectedTable}`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };


  useEffect(() => {
  if (role === "Show Orders") {
    const interval = setInterval(() => {
      ShowDataOrder(); // Fetch updated orders every 1 second
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }
  },[role]); // Depend on `role`

  

  useEffect(() => {
    if (selectedTable) {
      fetchDataOrder();
    }
  }, [selectedTable]);

  
  //fetch Bills===============================================================
  const fetchDataBills = async () => {
    try {
      // Fetch the bills data
      const data = await fetchBills();
  
      // Process each order to compute the bill
      const updatedBills = {};
      data.forEach((order) => {
        const total = order.orders.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );
  
        updatedBills[order.tableId] = {
          table: order.tableId,
          items: order.orders,
          total,
        };
      });
  
      // Update the state with all bills at once
      setBill((prev) => ({
        ...prev,
        ...updatedBills,
      }));
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };
  


  const TableData = async (table) => {
    if(!role){
      alert("select a role first!!");
      return;
    }
    setSelectedTable(table);
  };


  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([ fetchDataOrder(), fetchDataBills()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };
  


// Fetch orders and bills whenever a relevant change occurs
useEffect(() => {
  const fetchData = async () => {
    await refreshData();
  };
  fetchData();
}, []);
  // Now, this will trigger when these states change




  //SUGGESTIONS======================================================
  useEffect(() => {
    if (itemName) {
      const filtered = menu.filter((m) =>
        m.item.toLowerCase().includes(itemName.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [itemName]);

  

 // Add item to the order
const addToOrder = async (menuItem) => {
  if (!menuItem || quantity < 1 || !selectedTable) {
    alert("Please enter valid details and select a table!");
    return;
  }
  setLoading(true);
  // const notificationMessage = `Added ${menuItem.item} (Qty: ${quantity}) to table ${selectedTable}.`;
  // // Post notification to backend-----------------------------
  // await postNotification(notificationMessage);

  const newItem = {
    "tableId": selectedTable,
    "orders": [{
      "itemName": menuItem.item,
      "quantity": quantity,
      "price": menuItem.price,
    }]
  };
  
  setItemName("");
  setQuantity(1);
  setSuggestions([]);
  // Add Item Request-----------------------------------
  await AddItem(newItem);

  // Trigger data refresh for orders and bills
  refreshData();
  setLoading(false);

};



const triggerRemoveConfirmation = (index) => {
  setShowAlert(true); // Show the alert
  setRem(index); // Store the index to be removed
};


const handleConfirmRemoval = () => {
  if (Rem !== false) {
    removeItem(Rem);
  }
};

const handleCancelRemoval = () => {
  setShowAlert(false); // Hide the alert without removing the item
  setRem(false); // Reset the index
};



// Remove item from order
const removeItem = async (index) => {
  setLoading(true);
  const { itemName, quantity } = orders[selectedTable][index];

  const remItem = {
    "tableId": selectedTable,
    "itemName": itemName,
    "quantity": quantity,
  };

  await RemItem(remItem);
  // const notificationMessage = `Removed item from table ${selectedTable}.`;
  // // Post notification to backend-------------------------------------
  // await postNotification(notificationMessage);
  // Trigger data refresh for orders and bills
  setRem(false);
  setShowAlert(false);
  refreshData();
  setLoading(false);
};


// Create bill and generate total
const createBill = async () => {
  const tableOrder = orders[selectedTable];
  if (!tableOrder || tableOrder.length === 0) {
    alert("No items in the order to create a bill!");
    return;
  }

  alert(`Bill created for Table ${selectedTable}!`);
  const newBill = {
    tableId: selectedTable,
    orders: tableOrder.map((order) => ({
      itemName: order.itemName,
      quantity: order.quantity,
      price: order.price,
      
    }))
    ,
    totalPrice: tableOrder.reduce((sum, order) => sum + order.quantity * order.price, 0), // Calculate total price
  };

  await postBills(newBill);

  // Trigger data  bills after bill creation
  setOrders({});
  // Trigger data refresh for orders and bills
  refreshData();


};

// Handle Payment
const handlePayment = async (table) => {
  await RemBill({
    tableId: table,
  });

  // Alert for Take Order when payment is done
  alert(`Payment done for Table ${table}.`);

  // Trigger data refresh for orders and bills after payment
  setBill({})
  // Trigger data refresh for orders and bills
  refreshData();


};


  return (
    
  
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2px 10px", backgroundColor: "#f4f4f4" }}>

      


      {loading && <LoadingScreen />}
      {/* Notifications */}
      {/* {notifications.length > 0 && (
        <>
        <span
          style={{
            // position: "absolute",
            top: "20px",
            left: "50%",
            // transform: "translateX(-50%)",
            backgroundColor: "#FFB74D", // Light Orange
            color: "black",
            padding: "10px 20px",
            borderRadius: "5px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            fontSize: "14px",
            zIndex: 1000,
            alignContent:"center"
          }}
        >
          {notifications[notifications.length - 1]}
        </span>
        <br />
        </>
      )} */}

      <h1 style={{ textAlign: "center", color: "Black", fontWeight: "bold" }}>Order Management
      </h1>

     {/* Role Selection */}
<div style={{ display: "flex", justifyContent: "center", marginBottom: "5px" }}>
  <button
    onClick={() => setRole("Take Order")}
    style={{
      padding: "10px",
      backgroundColor: role === "Take Order" ? "#b50e2d" : "#9e9e9e",  // Dark red for active state
      color: "white",
      margin: "5px",
      borderRadius: "12px",  // More rounded corners for a premium feel
      border: "none",
      // width: "120px",
      fontSize: "13px",
      cursor: "pointer",
      fontWeight: role === "Take Order" ? "bold" : "normal",
      boxShadow: role === "Take Order" ? "0 4px 15px rgba(0, 0, 0, 0.2)" : "none", // Soft shadow for active button
      transition: "all 0.3s ease",  // Smooth transition for hover and active states
    }}
    onMouseEnter={(e) => e.target.style.backgroundColor = "#d91e3c"}  // Hover state
    onMouseLeave={(e) => e.target.style.backgroundColor = role === "Take Order" ? "#b50e2d" : "#9e9e9e"}  // Reset on hover leave
  >
    Take Order
  </button>
  <button
    onClick={() => setRole("Show Orders")}
    style={{
      padding: "10px",
      backgroundColor: role === "Show Orders" ? "#b50e2d" : "#9e9e9e",  // Dark red for active state
      color: "white",
      margin: "5px",
      borderRadius: "12px",  // More rounded corners for a premium feel
      border: "none",
      // width: "120px",
      fontSize: "13px",
      cursor: "pointer",
      fontWeight: role === "Show Orders" ? "bold" : "normal",
      boxShadow: role === "Show Orders" ? "0 4px 15px rgba(0, 0, 0, 0.2)" : "none", // Soft shadow for active button
      transition: "all 0.3s ease",  // Smooth transition for hover and active states
    }}
    onMouseEnter={(e) => e.target.style.backgroundColor = "#d91e3c"}  // Hover state
    onMouseLeave={(e) => e.target.style.backgroundColor = role === "Show Orders" ? "#b50e2d" : "#9e9e9e"}  // Reset on hover leave
  >
    Show Orders
  </button>
</div>


      {/* Table Selection */}
{role == "Take Order" && (
  <div>
    <h3 style={{ textAlign: "center", color: "#333", fontWeight: "bold", fontSize: "20px", marginBottom: "10px" }}>Select Table</h3>
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginBottom: "10px" }}>
      {[1, 2, 3, 4, 5, 6].map((table) => (
        <button
          key={table}
          onClick={() => TableData(table)}
          style={{
            padding: "10px",
            margin: "5px",
            // width: "130px",
            backgroundColor: selectedTable === table ? "#b50e2d" : "#9e9e9e",  // Premium red for active, soft gray for inactive
            color: "white",
            border: "none",
            borderRadius: "15px",  // More rounded for a modern premium look
            fontWeight: selectedTable === table ? "bold" : "normal", 
            fontSize: "14px",  // Slightly larger font size for better readability
            cursor: "pointer",
            boxShadow: selectedTable === table ? "0 4px 20px rgba(0, 0, 0, 0.2)" : "none",  // Soft shadow on active button
            transition: "all 0.3s ease",  // Smooth transition for hover and active states
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#d91e3c"}  // Hover effect
          onMouseLeave={(e) => e.target.style.backgroundColor = selectedTable === table ? "#b50e2d" : "#9e9e9e"}  // Reset on hover leave
        >
          Table {table}
        </button>
      ))}
    </div>
  </div>
)}

      

      {/* Take Order View */}
      {role === "Take Order" && selectedTable && (
        <div >
          <h3 style={{ color: "black", fontWeight: "bold",marginBottom:"5px" }}>Taking Orders for Table {selectedTable}</h3>

          {/* Input for Items */}
          <div style={{ display: "flex", marginBottom: "10px" }}>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{
              width: "10%",
              marginRight: "5px",
              marginLeft: "5px",
              padding: "7px",
              fontSize: "14px",
              borderRadius: "15px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            placeholder=" Search for items"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            style={{
              marginRight: "5px",
              marginLeft: "5px",
              flex: 1,
              padding: "7px",
              fontSize: "14px",
              borderRadius: "15px",
              border: "1px solid #ccc",
            }}
          />
        </div>

         {/* Item Suggestions */}
        <div style={{ margin: "0px 0px 0px 10px" }}>
          {suggestions.map((item, index) => (
            <div key={index} style={{ fontSize: "14px",padding: "5px", marginBottom: "2px", fontWeight: "bold" }}>
              {item.item} - ₹{item.price.toFixed(2)}
              <button
                onClick={() => addToOrder(item)}
                style={{
                  backgroundColor: "#FFEB3B", // Light Yellow
                  color: "black",
                  border: "none",
                  padding: "4px 15px",
                  marginLeft: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  borderRadius: "20px",
                }}
              >
                Add
              </button>
            </div>
          ))}
        </div>



{/* Confirmation Alert Box */}
{showAlert && (
  <div
    style={{
      position: "fixed",
      top: "50%", // Centers vertically
      left: "50%", // Centers horizontally
      transform: "translate(-50%, -50%)", // Adjust to center properly
      padding: "30px", // Increased padding for a larger box
      backgroundColor: "#fff", // White background
      color: "black",
      fontSize: "18px", // Increased font size
      fontWeight: "bold",
      borderRadius: "12px", // Slightly rounded corners
      boxShadow: "0 12px 20px rgba(0, 0, 0, 0.15)", // Added shadow for emphasis
      zIndex: 1000,
      animation: "fadeIn 0.5s ease-in-out", // Fade-in animation on display
      backdropFilter: "blur(5px)", // Apply blur to the background
    }}
  >
    <p>Are you sure you want to remove this item?</p>
    <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
      <button
        onClick={handleConfirmRemoval}
        style={{
          backgroundColor: "#4CAF50", // Green
          color: "white",
          padding: "12px 20px", // Increased padding for larger buttons
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          border: "none",
          fontSize: "16px", // Larger font size for buttons
        }}
      >
        Confirm
      </button>
      <button
        onClick={handleCancelRemoval} // Cancel
        style={{
          backgroundColor: "#F44336", // Red
          color: "white",
          padding: "12px 20px", // Increased padding for larger buttons
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          border: "none",
          fontSize: "16px", // Larger font size for buttons
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}

<style>{`
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
`}</style>






          {/* Order View */}
        {orders[selectedTable]?.length > 0 && (
          <div style={{
            marginTop: "10px",
            padding: "15px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            marginBottom: "10px",
          }}>
            <h4 style={{ color: "black", fontWeight: "bold" ,marginBottom: "10px"}}>Order Details</h4>
            <ul style={{ padding: "0px 10px" }}>
              {orders[selectedTable].map((item, index) => (
                <li key={index}  style={{
                  // marginBottom: "5px",
                  padding: "2px ",
                  listStyle: "none",
                }}>
                  <div
                      style={{
                        display:"flex",
                        justifyContent:"space-between",
                        // fontStyle: "italic",
                        color: "black",
                        fontSize: "16px",
                        fontWeight: "bold",
                        // width: "90%",
                        listStyle: "none",
                        borderRadius: "8px",
                        padding: "3px 10px",
                        backgroundColor: "#f5f0d7",
                        // boxShadow: "0 10px 14px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {item.quantity}x  {item.itemName}

                      <button
                    onClick={() => triggerRemoveConfirmation(index)}
                    style={{
                      backgroundColor: "#F44336", // Red
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "2px 15px",
                      fontSize: "16px",
                      marginLeft: "10px",
                      cursor: "pointer",
                      boxShadow: "0 10px 14px rgba(0, 0, 0, 0.2)",
                      fontWeight: "bold",
                    }}
                  >
                    ×
                  </button>
                    </div>
                  
                </li>
              ))}
            </ul>
            <center>
            <button
              onClick={createBill}
              style={{
                backgroundColor: "#fac082", // Light Orange
                color: "black",
                padding: "10px",
                borderRadius: "15px",
                cursor: "pointer",
                width: "100%",
                fontSize: "14px",
                marginTop: "10px",
                fontWeight: "bold",
                border:"2px solid black",
                boxShadow: "0 10px 14px rgba(0, 0, 0, 0.2)",
              }}
            >
              Create Bill
            </button></center>
          </div>
        )
        }

 {/* Bill View */}
        
 {Object.keys(bill).map((table) => (
      
      
      <div
        key={table}
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          // marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "black", fontWeight: "bold" ,marginBottom: "10px"}}>Bill for Table {bill[table].table}</h3>
        <ul style={{ padding: "0px 10px" }}>
          {bill[table].items.map((item, index) => (
            <li style={{ color: "black", fontSize: "14px",}}  key={index}>
              {item.itemName} &nbsp; Qty: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
            </li>
          ))}
        </ul>
        
        <h4 style={{ padding: "2px 10px" }}>

                  <span
                  style={{ backgroundColor: "#fac082", // Light Orange
                  color: "black",
                  borderRadius: "5px", 
                  fontSize: "14px",
                  padding: "2px 10px" }}
                  >Total: <strong>₹{bill[table].total.toFixed(2)}</strong>
                  </span>

          </h4>
        <button
          onClick={() => handlePayment(table)}
          style={{
            backgroundColor: "#5fa196", // Light Orange
            color: "black",
            padding: "10px",
            borderRadius: "15px",
            cursor: "pointer",
            width: "100%",
            fontSize: "14px",
            marginTop: "10px",
            fontWeight: "bold",
            border:"2px solid black",
            boxShadow: "0 10px 14px rgba(0, 0, 0, 0.2)",
          }}
        >
          Payment Done
        </button>
      </div>
    ))}
    </div>
      
    )}

      {/* Show Orders View */}
      {role === "Show Orders" && (
        <div style={{ padding: "5px", fontFamily: "Arial, sans-serif" }}>
        <h3 style={{ color: "black", fontWeight: "bold", marginBottom: "5px" }}>All Orders:</h3>
        {Object.keys(ordersShow).length > 0 ? (
          Object.entries(ordersShow).map(([tableId, tableOrders]) => (
            <div
              key={tableId}
              style={{
                padding: "2px 6px 5px 8px",
                backgroundColor: "#F9F9F9",
                borderRadius: "8px",
              }}
            >
              <h4
                style={{
                  fontWeight: "bold",
                  color: "black",
                  marginBottom: "5px",
                }}
              >
                Table {tableId}
              </h4>
              {tableOrders && tableOrders.length > 0 ? (
                <>
               
                <ul style={{ paddingLeft: "10px", margin: 0 }}>
                  {tableOrders.map((item, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: "5px",
                        padding: "5px",
                        listStyle: "none",
                      }}
                    >
                      <span
                        style={{
                          fontStyle: "italic",
                          color: "white",
                          fontSize: "14px",
                          // marginBottom: "5px",
                          listStyle: "none",
                          border: "1px solid grey",
                          borderRadius: "8px",
                          padding: "5px 10px",
                          backgroundColor: "black",
                          boxShadow: "0 12px 14px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {item.itemName} <strong style={{ color: "yellow" }}>x {item.quantity}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
                {/* <hr /> */}
                </>
              ) : (
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#999",
                    paddingLeft:"15px",
                    marginTop: "5px",
                  }}
                >
                  No orders available.
                </p>
              )}
            </div>
          ))
        ) : (
          <p
            style={{
              fontStyle: "italic",
              color: "#999",
              textAlign: "center",
              marginTop: "5px",
            }}
          >
            Loading Orders...
          </p>
        )}
      </div>
      )}
     
    </div>  
  ); 
};

const LoadingScreen = () => {
  return (
    <div style={styles.loadingOverlay}>
      <div style={styles.animationContainer}>
        {/* Lottie Player */}
        <lottie-player
          src="https://lottie.host/e2ecede1-b89d-4c13-a886-9bbc0bccb10c/4oDBIBEVpr.json"
          background="transparent"
          speed="1"
          style={{ width: "150px", height: "150px" }}
          loop
          autoplay
        ></lottie-player>
      </div>
      <p style={styles.loadingText}>Working On it ....</p>
    </div>
  );
};

const styles = {
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    // backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white background
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(5px)", // Adds blur to the background
  },
  animationContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: "10px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "black",
    fontFamily: "Arial, sans-serif",
  },
};





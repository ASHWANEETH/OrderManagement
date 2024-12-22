/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import menu from "./components/menu.json";
import {fetchNotifications,postNotification} from "./components/Notifications";
import {AddItem, fetchOrders,RemItem} from "./components/orders";
import {fetchBills,postBills,RemBill} from "./components/bills";


export const App = () => {
  const [role, setRole] = useState(""); // Take Order or Show Orders
  const [selectedTable, setSelectedTable] = useState(); // Current table
  const [orders, setOrders] = useState({}); // {table: [items]}
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [suggestions, setSuggestions] = useState([]); // Suggestions list
  const [bill, setBill] = useState({}); // Bill display for each table
  const [notifications, setNotifications] = useState([" "]); // List of notifications
  const [loading, setLoading] = useState(false);



  //fetch Notification==============================================================
  const fetchDataNoti = async () => {
    try {
      // Fetch new notifications
      const data = await fetchNotifications();
  
      // Update notifications with the new data
      setNotifications((prev) => [...prev, data]);
  
      // Reset notifications after 3 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.length > 0 ? ["📌"] : prev); // Ensure no overwriting if notifications are added during the delay
      }, 3000);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  


  //fetch Orders===================================================================
  const fetchDataOrder = async () => {
    try {
      // Step 1: Reset orders state
      setOrders({});
  
      // Step 2: Fetch all current orders
      const currentOrders = await fetchOrders();
  
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
      } else {
        console.warn(`No orders found for table ID: ${selectedTable}`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

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
      await Promise.all([fetchDataNoti(), fetchDataOrder(), fetchDataBills()]);
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

  const notificationMessage = `Added ${menuItem.item} (Qty: ${quantity}) to table ${selectedTable}.`;
  // Post notification to backend-----------------------------
  await postNotification(notificationMessage);

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


};

// Remove item from order
const removeItem = async (index) => {
  const { itemName, quantity } = orders[selectedTable][index];

  const remItem = {
    "tableId": selectedTable,
    "itemName": itemName,
    "quantity": quantity,
  };

  await RemItem(remItem);
  
    // Trigger data refresh for orders and bills
    refreshData();

  const notificationMessage = `Removed item from table ${selectedTable}.`;
  // Post notification to backend-------------------------------------
  postNotification(notificationMessage);
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
    })),
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
  
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f4f4f4" }}>
      {loading && <LoadingScreen />}
      {/* Notifications */}
      {notifications.length > 0 && (
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
      )}

      <h1 style={{ textAlign: "center", color: "Black", fontWeight: "bold" }}>Order Management
      </h1>

      {/* Role Selection */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setRole("Take Order")}
          style={{
            padding: "15px",
            backgroundColor: role === "Take Order" ? "#735454" : "#ccc",
            color: "white",
            margin: "5px",
            borderRadius: "5px",
            border: "none",
            width: "100px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Take Order
        </button>
        <button
          onClick={() => setRole("Show Orders")}
          style={{
            padding: "15px",
            backgroundColor: role === "Show Orders" ? "#735454" : "#ccc",
            color: "white",
            margin: "5px",
            borderRadius: "5px",
            border: "none",
            width: "100px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Show Orders
        </button>
      </div>

      {/* Table Selection */}
      {role && (
        <div>
        <h3 style={{ textAlign: "center", color: "#512DA8", fontWeight: "bold" }}>Select Table</h3>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          {[1, 2, 3, 4, 5, 6].map((table) => (
            <button
              key={table}
              onClick={() => TableData(table)}
              style={{
                padding: "15px",
                margin: "5px",
                width: "120px",
                backgroundColor: selectedTable === table ? "#3F51B5" : "#607D8B",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Table {table}
            </button>
          ))}
        </div>
        </div>
      )}
      

      {/* Take Order View */}
      {role === "Take Order" && selectedTable && (
        <div>
          <h3 style={{ color: "black", fontWeight: "bold" }}>Taking Orders for Table {selectedTable}</h3>

          {/* Input for Items */}
          <div style={{ display: "flex", marginBottom: "15px" }}>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{
                width: "60px",
                marginRight: "10px",
                padding: "10px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <input
              type="text"
              placeholder="Search for items"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
           
          </div>

          {/* Item Suggestions */}
          <div style={{ marginBottom: "20px" }}>
            {suggestions.map((item, index) => (
              <div key={index} style={{ padding: "5px", marginBottom: "10px", fontWeight: "bold" }}>
                {item.item} - ₹{item.price.toFixed(2)}
                <button
                  onClick={() => addToOrder(item)}
                  style={{
                    backgroundColor: "#FFEB3B", // Light Yellow
                    color: "black",
                    border: "none",
                    padding: "5px 10px",
                    marginLeft: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    borderRadius: "5px",
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>

          {/* Order View */}
          {orders[selectedTable]?.length > 0 && (
            <div>
              <h4 style={{ color: "#3F51B5", fontWeight: "bold" }}>Order Summary</h4>
              <ul>
                {orders[selectedTable].map((item, index) => (
                  <li key={index}>
                    {item.quantity} x {item.itemName}
                    <button
                      onClick={() => removeItem(index)}
                      style={{
                        backgroundColor: "#F44336", // Red
                        color: "white",
                        border: "none",
                        padding: "0 5px",
                        borderRadius: "2px",
                        fontSize: "16px",
                        marginLeft: "10px",
                        cursor: "pointer",
                      }}
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={createBill}
                style={{
                  backgroundColor: "#FFB74D", // Light Orange
                  color: "black",
                  padding: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "100%",
                  fontSize: "16px",
                  marginTop: "10px",
                }}
              >
                Create Bill
              </button>
            </div>
          )}
           {/* Bill View */}
      {Object.keys(bill).map((table) => (
        <div
          key={table}
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "#512DA8", fontWeight: "bold" }}>Bill for Table {bill[table].table}</h3>
          <ul>
            {bill[table].items.map((item, index) => (
              <li key={index}>
                {item.itemName} - Qty: {item.quantity} - ₹{item.quantity * item.price}
              </li>
            ))}
          </ul>
          <h4 style={{ fontWeight: "bold" }}>Total: ₹{bill[table].total.toFixed(2)}</h4>
          <button
            onClick={() => handlePayment(table)}
            style={{
              backgroundColor: "#FFEB3B", // Light Yellow
              color: "black",
              padding: "15px",
              width: "100%",
              borderRadius: "5px",
              fontSize: "18px",
              cursor: "pointer",
              marginTop: "10px",
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
  <div>
    <h3 style={{ color: "#512DA8", fontWeight: "bold" }}>All Orders</h3>
    {Object.keys(orders).length > 0 ? (
      Object.entries(orders).map(([tableId, tableOrders]) => (
        <div key={tableId} style={{ marginBottom: "20px" }}>
          <h4 style={{ fontWeight: "bold" }}>Table {tableId}</h4>
          <ul>
            {tableOrders.map((item, index) => (
              <li key={index} style={{ fontWeight: "bold" }}>
                {item.quantity} x {item.itemName}
              </li>
            ))}
          </ul>
        </div>
      ))
    ) : (
      <p style={{ fontStyle: "italic", color: "#999" }}>No orders available.</p>
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
          src="https://lottie.host/2dd9369d-dde8-462b-9ea8-47bcb6b4ff8e/qqcw9uKdvv.json"
          background="transparent"
          speed="1"
          style={{ width: "100px", height: "100px" }}
          loop
          autoplay
        ></lottie-player>
      </div>
      <p style={styles.loadingText}>Loading...</p>
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
    color: "#3F51B5",
    fontFamily: "Arial, sans-serif",
  },
};





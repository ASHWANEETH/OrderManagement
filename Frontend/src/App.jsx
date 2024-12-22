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
    const data = await fetchNotifications();  // Wait for the async function to resolve
    // console.log(data);  // Logs the message
    setNotifications((prev) => [
      ...prev,
      data,
    ]);

    setTimeout(() => {
      setNotifications([" "]); // Reset notifications to an empty or default state
    }, 3000);

  };


  //fetch Orders===================================================================
  const fetchDataOrder = async () => {
    try {
      // Step 1: Fetch the current orders for the selected table
      const currentOrders = await fetchOrders(); // This will fetch orders
      const {orders} = currentOrders.find((entry) => entry.tableId === selectedTable);
      setOrders({});
      orders.forEach(order=>{
        const newItem = { itemName: order.itemName, quantity: order.quantity, price: order.price };
        setOrders((prev) => ({
          ...prev,
          [selectedTable]: prev[selectedTable]  // Fetch existing orders for the selected table
            ? [...prev[selectedTable], newItem]  // Add the new item to the existing orders
            : [newItem],  // If no orders exist, add the new item as the first order
        }));
      })
    } catch (error) {
      console.error('Error adding new item:', error);
    }
  };


  
  //fetch Bills===============================================================
  const fetchDataBills = async () => {
    const data = await fetchBills();  // Wait for the async function to resolve
 
    data.forEach(order=>{
      const total = order.orders.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      setBill((prev) => ({
            ...prev,
            [order.tableId]: { table:order.tableId, items: order.orders, total },
          }));
    })
    
  };


  const TableData = async (table) => {
    if(!role){
      alert("select a role first!!");
      return;
    }
    await setSelectedTable(table);
    await refreshData();
  };

  const RoleData = async (role) => {
    selectedTable()
    setRole(role);
    await refreshData();
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
          onClick={() => RoleData("Take Order")}
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
          onClick={() => RoleData("Show Orders")}
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
                        padding: "5px",
                        borderRadius: "5px",
                        fontSize: "16px",
                        marginLeft: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Remove
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
      {role === "Show Orders" && selectedTable && (
        <div>
          <h3 style={{ color: "#512DA8", fontWeight: "bold" }}> Orders for Table {selectedTable}</h3>
          <ul>
            {orders[selectedTable]?.map((item, index) => (
              <li key={index} style={{ fontWeight: "bold" }}>
                {item.itemName} - Qty: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}

     
    </div>
    
  );
  
};

const LoadingScreen = () => {
  return (
    <div style={styles.loadingScreen}>
    <div style={styles.animationContainer}>
      <script src="https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js"></script>
      <lottie-player 
        src="https://lottie.host/2dd9369d-dde8-462b-9ea8-47bcb6b4ff8e/qqcw9uKdvv.json" 
        background="#ffffff" 
        speed="1" 
        style={{ width: "300px", height: "300px" }} 
        loop 
        controls 
        autoplay 
        direction="1" 
        mode="normal">
      </lottie-player>
    </div>
    <p style={styles.loadingText}>Working...</p>
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
    backdropFilter: "blur(2px)", // Adds blur to the background
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





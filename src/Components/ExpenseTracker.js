import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Radio, Select, Card, DatePicker, Space,  notification, Image } from 'antd';
import { GiHouse, GiForkKnifeSpoon, GiCash } from "react-icons/gi";
import { FaMotorcycle, FaHospitalUser, FaShoppingCart } from "react-icons/fa";
import { BsFillStarFill } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaArrowCircleDown, FaArrowCircleUp } from "react-icons/fa";
import moment from 'moment';
import './expenseTracker.scss';
import ExpenseBudgetChart from './ExpenseBudgetChart';
import axios from "axios";

const { Option } = Select;

const ExpenseTracker = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(1);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [form] = Form.useForm();
  const [greeting, setGreeting] = useState('');
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [warningClosed, setWarningClosed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [items, setItems] = useState([]); 
  const [totalBudget, setTotalBudget] = useState(0);
  const [expense, setExpense] = useState(0);
  const [category, setCategory] = useState("");

  useEffect(() => {
      console.log("Category updated:", category);
  }, [category]);


  useEffect(() => {
    axios.get("http://localhost:5000/api/items")
      .then(res => {
        setItems(res.data);

        const expenses = res.data.filter(i => i.type === 1).reduce((sum, i) => sum + i.value, 0);
        const income = res.data.filter(i => i.type === 2).reduce((sum, i) => sum + i.value, 0);

        setExpense(expenses);
        setTotalBudget(income);
        setRemainingAmount(income - expenses);
      })
      .catch(err => console.error("Error fetching items:", err));
  }, []);



  const formatDate = (dateString) => {
    console.log("DATE TO FORMAT:", dateString); 
    return moment(dateString).format("DD MMMM YYYY");  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
 
  const getRowName = (rowname) => {
    return rowname.type === 1 ? 'expenseRow' : 'budgetRow';
  };
  
  const categoryIcons = {
    salary: <GiCash />,
    housing: <GiHouse />,
    transport: <FaMotorcycle />,
    food: <GiForkKnifeSpoon />,
    healthcare: <FaHospitalUser />,
    shopping: <FaShoppingCart />,
  };
  const getCategoryIcon = (category) => categoryIcons[category] || <BsFillStarFill />;
  
  const getCategoryName = (category) => {
    switch (category) {
      case 'salary':
        return 'Salary';
      case 'housing':
        return 'Housing';
      case 'transport':
        return 'Transport';
      case 'food':
        return 'Food';
      case 'healthcare':
        return 'HealthCare';
      case 'shopping':
        return 'Shopping';
      default:
        return 'Others';
    }
  };
  
  const showModal = () => {
    setOpen(true);
    setSelectedDate(null);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        setOpen(false);

        const amount = parseFloat(values.value);
        if(isNaN(amount)||amount <=0){
          notification.error({message: 'Invalid Amount'});
          return;
        }

        const newItem = {
          ...values,
          type: Number(value), // 1 = Expense, 2 = Income
          date: selectedDate
            ? selectedDate.format("YYYY-MM-DD")
            : new Date().toISOString().split("T")[0],
          category: values.category,
          value: parseFloat(values.value),
        };

        if (newItem.type === 1) {
          const currentBalance = totalBudget - expense;
          if (newItem.value > currentBalance) {
            notification.error({
              message: "Not Allowed",
              description: `Expense (₹${newItem.value}) cannot exceed your balance (₹${currentBalance})`,
              duration: 3,
            });
            return; 
          }
        }

        axios.post("http://localhost:5000/api/items", newItem)
          .then((res) => {
            setItems([...items, res.data]); 

            if (res.data.type === 2) {
              setTotalBudget(totalBudget + res.data.value);
              notification.success({ message: "Budget Added", duration: 2 });
            } else {
              setExpense(expense + res.data.value);
              notification.success({
                message: "Expense Added",
                description: `Remaining balance: ₹${totalBudget - (expense + res.data.value)}`,
                duration: 3,
              });
            }

            form.resetFields();
            setSelectedDate(moment());
            setIsModalVisible(false);
          })
          .catch(err => {
            console.error("Error adding item:", err);
            notification.error({ message: "Failed to add item" });
          });
      }, 1000);
    });
  };


  const handleCancel = () => {
    setOpen(false);
    setIsModalVisible(false);
  };

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const onOk = (value) => {
    if (value) {
      setSelectedDate(value.format("YYYY-MM-DD"));
    } else {
      setSelectedDate(null);
    }
  };
  

  useEffect(() => {
    const getCurrentGreeting = () => {
      const currentHour = new Date().getHours();

      if (currentHour >= 0 && currentHour < 12) {
        setGreeting('Good Morning');
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };
    getCurrentGreeting();
    
    setRemainingAmount(totalBudget-expense);
    console.log("T",totalBudget);
    if((remainingAmount < 0 && !warningClosed ) || (totalBudget===0 && expense !==0 )){
      setWarningClosed(true);
      notification.warning({
        message: 'Warning: Your Budget is less than your Expenses!',
        duration: 3,
      });
    }
  }, [totalBudget,expense,warningClosed,remainingAmount]);

    
  const clearData = () => {
    Modal.confirm({
      title: "Are you sure?",
      content: "This will delete all stored data permanently.",
      onOk: () => {
        axios.delete("http://localhost:5000/api/items")
          .then(() => {
            setItems([]);
            setTotalBudget(0);
            setExpense(0);
            setRemainingAmount(0);

            notification.success({
              message: "Data Cleared Successfully!",
              duration: 2,
            });
          })
          .catch(err => {
            console.error("Error clearing data:", err);
            notification.error({ message: "Failed to clear data" });
          });
      },
    });
  };


  const handleDelete = (id) => {
    console.log("Deleting ID:", id); 
    axios.delete(`http://localhost:5000/api/items/${id}`)
      .then(res => {
        console.log("Deleted:", res.data);

        const updatedItems = items.filter(item => item._id !== id);
        setItems(updatedItems);

        const deletedItem = items.find(item => item._id === id);
        if (deletedItem) {
          if (deletedItem.type === 2) setTotalBudget(prev => prev - deletedItem.value);
          else setExpense(prev => prev - deletedItem.value);
        }
        setRemainingAmount(
          updatedItems.filter(i => i.type === 2).reduce((sum, i) => sum + i.value, 0) -
          updatedItems.filter(i => i.type === 1).reduce((sum, i) => sum + i.value, 0)
        );

        notification.success({ message: "Deleted Successfully", duration: 2 });
      })
      .catch(err => {
        console.error("Error deleting item:", err);
        notification.error({ message: "Failed to delete item" });
      });
  };



  
  return (
    <div className="expense-tracker">

      <div className='header'>
        <Image width={120} src="logo.png" className='title'  />
        <h1>Heyy!! {greeting}</h1> 
      </div>
     
        <div className='amountBox'>
          <div className='amountSection'>
            <div className='remainingAmountValue'>Balance
              <div>₹ {remainingAmount}</div>
            </div>
            <div className='incomeAmountValue'>Income
              <div>₹ {totalBudget}</div>
            </div>
            <div className='expenseAmountValue'>Expenses
              <div>₹ {expense}</div>
            </div>
          </div>
          <div className='buttonClass'>
            <Button className="add-button" onClick={showModal}>Add</Button>
            <Button className="delete-button"type="danger" onClick={clearData}>Clear</Button>
          </div> 
        </div>

        <div className="displayingExpenses">
          <div className="columns-container">
            {[
              { type: 2, title: "Income", rowClass: "budgetRow", prefix: "+" },
              { type: 1, title: "Expenses", rowClass: "expenseRow", prefix: "-" },
            ].map(({ type, title, rowClass, prefix }) => (
              <div className="column" key={type}>
                <h2>{title}</h2>
                <div className="scroll-container">
                  {items
                    .map((item, originalIndex) => ({ item, originalIndex }))
                    .filter(({ item }) => item.type === type)
                    .map(({ item, originalIndex }) => {
                      const category = item.category?.toLowerCase() || "default";
                      return (
                        <Card
                          key={originalIndex}
                          className={`expense-budget-card ${rowClass}`}
                        >
                          <div className="singleCard">
                            <div className="firstFlex">
                              <div className={`icon ${category}`}>
                                {getCategoryIcon(category)}
                              </div>
                              <div className="categoryName">
                                <div>{getCategoryName(category)}</div>
                                <p>{item.name}</p>
                              </div>
                            </div>
                            <div className="categoryInfo">
                              <p className="amount">{prefix} ₹{item.value}</p>
                              <p className="date">{formatDate(item.date)}</p>
                            </div>
                            <div className="DeleteButtonCard">
                              <Button
                                type="link"
                                danger
                                onClick={() => handleDelete(item._id)}
                              >
                                <RiDeleteBin6Line />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
          <ExpenseBudgetChart items={items} />
        </div>

        <Modal
          title="Add Item"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button loading={loading} onClick={handleOk}>
              Add
            </Button>,
            <Button onClick={handleCancel}>Cancel</Button>,
          ]}
        >
          <Form form={form} className="modal-form">
            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter a name' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Amount" name="value" rules={[{ required: true, message: 'Please enter a value' }]}>
              <Input type='number' min={1} />
            </Form.Item>
            <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please select a category' }]}>
              <Select placeholder="Select a category">
                <Option value="salary">Salary</Option>
                <Option value="housing">Housing</Option>
                <Option value="transport">Transport</Option>
                <Option value="food">Food</Option>
                <Option value="healthcare">Healthcare</Option>
                <Option value="shopping">Shopping</Option>
                <Option value="others">Others</Option>
              </Select>
            </Form.Item>
            <Radio.Group onChange={onChange} value={value}>
              <Radio value={1}>Expense</Radio>
              <Radio value={2}>Income</Radio>
            </Radio.Group>
            <Space>
            <Form.Item label="Date">
            <DatePicker value={selectedDate} onChange={handleDateChange} />
            </Form.Item>
            </Space>
          </Form>
        </Modal>
    </div>
  );
};

export default ExpenseTracker;

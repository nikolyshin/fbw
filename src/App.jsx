import { Layout, Menu } from "antd";
import { useNavigate, Route, Routes } from "react-router-dom";
import "antd/dist/antd.css";
import GoodList from "./components/GoodList";
import Stats from "./components/Stats";
import "./App.css";
import AppHeader from "./components/AppHeader/AppHeader";

import Login from "./components/Login/Login";
import { fetchUsers } from "./api";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import DashBoard from "./components/DashBoard";
import ModalLogout from "./components/ModalLogout";
import moment from "moment";
import Delivery from "./components/Delivery";

const { Content, Footer, Sider, Header } = Layout;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentWbKey, setCurrentWbKey] = useState([]);
  const [date, setDate] = useState([moment(), moment()]);
  const [user, setUser] = useState(null);
  const [cookie] = useCookies(["token"]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  let navigate = useNavigate();

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchUsers({});
      if (res) {
        setUser(res);
      } else {
        setError(res.detail);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cookie.token) {
      getUsers();
    }
  }, [cookie]);

  const menuItems = [
    {
      label: "Склад DashBoard",
      key: "dashBoard",
      onClick: () => {
        navigate("/");
      },
    },
    {
      label: "Good List",
      key: "goodList",
      onClick: () => {
        navigate("/goodlist");
      },
    },
    {
      label: "Stats",
      key: "stats",
      onClick: () => {
        navigate("/stats");
      },
    },
    {
      label: "Поставки",
      key: "delivery",
      onClick: () => {
        navigate("/delivery");
      },
    },
    {
      label: "Выйти",
      key: "logout",
      onClick: () => {
        setIsModalVisible(true);
      },
    },
  ];
  if (!cookie.token) {
    return <Login />;
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <ModalLogout show={isModalVisible} setShow={setIsModalVisible} />
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="company">
          <p>
            <b>{user?.username}</b>
          </p>
          {user?.companies.map((company, index) => (
            <p key={index}>{company.name}</p>
          ))}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={menuItems}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: "200px",
        }}
        className="site-layout"
      >
        <Header>
          <AppHeader
            wbKeys={user?.wb_keys}
            currentWbKey={currentWbKey}
            setCurrentWbKey={setCurrentWbKey}
            date={date}
            setDate={setDate}
          />
        </Header>

        <Content>
          <div
            className="site-layout-background"
            style={{
              marginTop: 140,
              padding: 24,
              minHeight: "100vh",
            }}
          >
            <Routes>
              <Route
                path="/goodlist"
                element={<GoodList currentWbKey={currentWbKey} />}
              />
              <Route
                path="/stats"
                element={<Stats date={date} currentWbKey={currentWbKey} />}
              />
              <Route path="/delivery" element={<Delivery />} />
              <Route
                path="/"
                element={<DashBoard currentWbKey={currentWbKey} date={date} />}
              />
            </Routes>
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          FBW ©2022
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;

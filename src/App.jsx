import { Layout, Menu } from "antd";
import { useNavigate, Route, Routes } from "react-router-dom";
import "antd/dist/antd.css";
import GoodList from "./components/GoodList";
import Stats from "./components/Stats";
import "./App.css";
import AppHeader from "./components/AppHeader/AppHeader";
import Delivery from "./components/Delivery";
import Login from "./components/Login/Login";
import { fetchUsers } from "./api";
import { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';

const { Content, Footer, Sider } = Layout;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [goods, setGoods] = useState([]);
  const [cookie] = useCookies(['token']);

  let navigate = useNavigate();

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchUsers({});
      if (res) {
        setGoods(res);
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
    getUsers();
  }, []);

  const menuItems = [
    {
      label: "Good List",
      key: "goodList",
      onClick: () => {
        navigate("/goodList");
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
      <Sider>
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <AppHeader />

        <Content>
          <div
            className="site-layout-background"
            style={{
              padding: 24,
              minHeight: "100vh",
            }}
          >
            <Routes>
              <Route path="/goodlist" element={<GoodList />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/delivery" element={<Delivery />} />
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

import { Layout, Menu } from "antd";
import { useNavigate, Route, Routes } from "react-router-dom";
import "antd/dist/antd.css";
import GoodList from "./components/GoodList";
import Stats from "./components/Stats";
import "./App.css";
import AppHeader from "./components/AppHeader/AppHeader";
import Delivery from "./components/Delivery";
import Login from "./components/Login/Login";
import { useEffect, useState } from "react";
const { Content, Footer, Sider } = Layout;

const App = () => {
  let navigate = useNavigate();
  const { auth, setAuth } = useState(false);

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

  if (!auth) {
    return <Login setAuth={(bool) => setAuth(bool)} />
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

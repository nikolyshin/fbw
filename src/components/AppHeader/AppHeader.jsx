import { DatePicker, InputNumber } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useLocation, useNavigate, Route, Routes } from "react-router-dom";
import "./AppHeader.css";

const { RangePicker } = DatePicker;

const AppHeader = () => {
  const { days, setDays } = useState();
  return (
    <div className={"wrapper"}>
      <div className="box">
        <div>{`Текущая дата: ${dayjs(new Date()).format(
          "DD.MM.YY HH.mm"
        )}`}</div>
        <div>Последнее обновление</div>
      </div>
      <div className="box">
        <div className="title">Агрегируем по дате</div>
        <RangePicker />
        <div className="title">Планируем поставку на</div>
        <InputNumber min={1} value={days} onChange={setDays} />
      </div>
      <div className="box"></div>
    </div>
  );
};

export default AppHeader;

import { DatePicker, InputNumber } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useLocation, useNavigate, Route, Routes } from "react-router-dom";
import "./AppHeader.css";

const { RangePicker } = DatePicker;
const status = [0, 1, 2, 3, 4]
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
        <RangePicker />
        <InputNumber min={1} value={days} onChange={setDays} />
      </div>
      <div className="box">
        <div>Надбавка 20%</div>
      </div>
      <div className="box">
        <div>Остатки на складе</div>
        <div className="progressWrapper">
          {status.map((item) => (
            <div className="progress"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppHeader;

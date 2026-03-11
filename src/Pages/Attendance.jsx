import React, { useEffect, useState } from "react";
import { FaCheck, FaClock, FaTimes, FaDownload, FaCalendarAlt } from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "../css/Attendance.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";

const Attendance = () => {

const [attendanceData, setAttendanceData] = useState([]);
const [view, setView] = useState("weekly");
const [currentDate, setCurrentDate] = useState(new Date());

const months = [
"January","February","March","April","May","June",
"July","August","September","October","November","December"
];

useEffect(() => {

const unsub = onSnapshot(collection(db,"attendance"),(snapshot)=>{

const data = snapshot.docs.map(doc => ({
id:doc.id,
...doc.data()
}));

setAttendanceData(data);

});

return () => unsub();

},[]);

const totalEmployees = attendanceData.length;

const onTimeCount = attendanceData.filter(
(item)=>item.status && item.status.toLowerCase().includes("on")
).length;

const lateCount = attendanceData.filter(
(item)=>item.status && item.status.toLowerCase().includes("late")
).length;

const absentCount = attendanceData.filter(
(item)=>item.status && item.status.toLowerCase().includes("absent")
).length;

const onTimePercentage =
totalEmployees>0
?((onTimeCount/totalEmployees)*100).toFixed(1)
:0;

const exportCSV = () => {

const headers=["Name","Clock In","Clock Out","Break","Status"];

const rows = attendanceData.map(emp=>[
emp.name,
emp.clockIn,
emp.clockOut,
emp.breakDuration,
emp.status
]);

const csvContent =
"data:text/csv;charset=utf-8,"+
[headers,...rows].map(e=>e.join(",")).join("\n");

const encodedUri = encodeURI(csvContent);
const link=document.createElement("a");

link.setAttribute("href",encodedUri);
link.setAttribute("download","attendance.csv");

document.body.appendChild(link);
link.click();

};

const formatDateRange = () => {

const date=new Date(currentDate);

if(view==="daily"){
return date.toLocaleDateString("en-US",{
month:"short",
day:"numeric",
year:"numeric"
});
}

if(view==="weekly"){

const start=new Date(date);
start.setDate(date.getDate()-date.getDay());

const end=new Date(start);
end.setDate(start.getDate()+6);

return `${start.toLocaleDateString("en-US",{month:"short",day:"numeric"})}
-
${end.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;
}

if(view==="monthly"){
return date.toLocaleDateString("en-US",{
month:"long",
year:"numeric"
});
}

};

const getWeeksInMonth = () => {

const year=currentDate.getFullYear();
const month=currentDate.getMonth();

const weeks=[];
let firstDay=new Date(year,month,1);

firstDay.setDate(firstDay.getDate()-firstDay.getDay());

while(true){

const start=new Date(firstDay);
const end=new Date(start);
end.setDate(start.getDate()+6);

weeks.push({start,end});

firstDay.setDate(firstDay.getDate()+7);

if(firstDay.getMonth()!==month && firstDay.getDate()>7){
break;
}

}

return weeks;

};

const weeks = getWeeksInMonth();

return(

<div className="attendance-layout">

<Sidebar/>

<div className="attendance-container">

<div className="attendance-header">

<div className="attendance-title">
<h2>Attendance</h2>
<p>Track and manage employee clock-in records.</p>
</div>

<div className="attendance-controls">

<div className="view-switch">

<button
className={view==="daily"?"active":""}
onClick={()=>{
setView("daily");
setCurrentDate(new Date());
}}
>
Daily
</button>

<button
className={view==="weekly"?"active":""}
onClick={()=>setView("weekly")}
>
Weekly
</button>

<button
className={view==="monthly"?"active":""}
onClick={()=>setView("monthly")}
>
Monthly
</button>

<div className="divider"></div>

{view==="monthly"? (

<select
className="month-dropdown"
value={currentDate.getMonth()}
onChange={(e)=>{
const newDate=new Date(currentDate);
newDate.setMonth(Number(e.target.value));
newDate.setDate(1);
setCurrentDate(newDate);
}}
>

{months.map((month,index)=>(
<option key={index} value={index}>
{month} {currentDate.getFullYear()}
</option>
))}

</select>

):view==="weekly"? (

<select
className="week-dropdown"
value={weeks.findIndex(
(week)=>currentDate>=week.start && currentDate<=week.end
)}
onChange={(e)=>{
const week=weeks[e.target.value];
setCurrentDate(new Date(week.start));
}}
>

{weeks.map((week,index)=>(

<option key={index} value={index}>

{week.start.toLocaleDateString("en-US",{month:"short",day:"numeric"})}
-
{week.end.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}

</option>

))}

</select>

):(

<div className="date-display">
<FaCalendarAlt/> {formatDateRange()}
</div>

)}

</div>

</div>

</div>

<div className="summary-cards">

<div className="card">
<div className="icon green"><FaCheck/></div>
<h4>On Time</h4>
<h2>{onTimePercentage}%</h2>
<span>{onTimeCount} Employees</span>
</div>

<div className="card">
<div className="icon yellow"><FaClock/></div>
<h4>Late Arrivals</h4>
<h2>{lateCount}</h2>
</div>

<div className="card">
<div className="icon red"><FaTimes/></div>
<h4>Absent</h4>
<h2>{absentCount}</h2>
</div>

</div>

<div className="attendance-table-container">

<div className="table-top">

<div className="filters">

<select>
<option>All Department</option>
<option>Sales</option>
<option>HR</option>
<option>IT</option>
</select>

<select>
<option>All Shifts</option>
<option>Morning</option>
<option>Evening</option>
<option>Night</option>
</select>

</div>

<button className="export-btn" onClick={exportCSV}>
<FaDownload/> Export Log
</button>

</div>

<table>

<thead>
<tr>
<th>EMPLOYEE</th>
<th>CLOCK IN</th>
<th>CLOCK OUT</th>
<th>BREAK DURATION</th>
<th>STATUS</th>
<th>ACTION</th>
</tr>
</thead>

<tbody>

{attendanceData.length===0? (

<tr>
<td colSpan="6" style={{textAlign:"center"}}>
No attendance records found
</td>
</tr>

):(attendanceData.map((item)=>(

<tr key={item.id}>

<td>

<div className="employee-info">

<div className="avatar">
{item.name?.charAt(0)}
</div>

<div>
<p>{item.name}</p>
<span>ID: {item.employeeId}</span>
</div>

</div>

</td>

<td>{item.clockIn}</td>
<td>{item.clockOut}</td>
<td>{item.breakDuration}</td>

<td>

<span
className={`status ${
item.status?.toLowerCase().includes("late")
?"late"
:item.status?.toLowerCase().includes("absent")
?"absent"
:"ontime"
}`}
>

{item.status}

</span>

</td>

<td>•••</td>

</tr>

)))}

</tbody>

</table>

</div>

</div>

</div>

);

};

export default Attendance;
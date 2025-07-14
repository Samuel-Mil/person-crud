import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Views/Home";
import Login from "./Views/Login";
import EditPerson from "./Views/EditPerson";
import CreatePerson from "./Views/CreatePerson";
import MainLayout from "./Components/MainLayout";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/edit_person" element={<EditPerson />} />
          <Route path="/create_person" element={<CreatePerson />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

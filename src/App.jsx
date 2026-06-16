import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./assets/components/Header/Header.jsx";
import "./App.css";
import Login from "./assets/pages/Login/Login.jsx";
import RecuperarSenha from "./assets/pages/RecuperarSenha/RecuperarSenha.jsx";
import VerificarCodigo from "./assets/pages/VerificarCodigo/VerificarCodigo.jsx";
import ConfirmarCodigo from "./assets/pages/ConfirmarCodigo/ConfirmarCodigo.jsx";
import Footer from "./assets/components/Footer/Footer.jsx";
import Dashboard from "./assets/pages/Dashbord/Dashboard.jsx";
import AdicionarUsuario from "./assets/pages/AdicionarUsuario/AdicionarUsuario.jsx";
import EditarPerfil from "./assets/pages/EditarPerfil/EditarPerfil.jsx";
import Paginaerro from "./assets/pages/Paginaerro/Paginaerro.jsx";
import Cardapio from "./assets/pages/Cardapio/Cardapio.jsx";
import AdicionarLanche from "./assets/pages/AdicionarLanche/AdicionarLanche.jsx";
import AdicionarMesa from "./assets/pages/AdicionarMesa/AdicionarMesa.jsx";

function App() {
    return (
        <Router>
            <div className="app">
                <Header />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/recuperar-senha" element={<RecuperarSenha />} />
                    <Route path="/verificar-codigo" element={<VerificarCodigo />} />
                    <Route path="/confirmar-codigo" element={<ConfirmarCodigo />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/adicionarusuarios" element={<AdicionarUsuario />} />
                    <Route path="/editarperfil" element={<EditarPerfil />} />
                    <Route path="/cardapio" element={<Cardapio />} />
                    <Route path="/adicionar-lanche" element={<AdicionarLanche />} />
                    <Route path="/adicionarmesas" element={<AdicionarMesa />} />
                    {/* ✅ Rota 404 sempre por último */}
                    <Route path="*" element={<Paginaerro />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
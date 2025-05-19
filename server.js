import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()
const PORT = 3333
const baseDados = '../database/base_dados.json'


app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(express.json())

app.get('/instrutores', (req, res) => {
    fs.readFile(baseDados, 'utf-8', (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ mensagem: "Erro ao ler a database!" })
            return
        }

        try {
            const dataInstrutores = JSON.parse(data)
            const usuarios = dataInstrutores.usuarios
            const instrutores = usuarios.filter(usuario => usuario.tipo === "instrutor")

            console.log(instrutores)
            res.status(200).json(instrutores)
        } catch (err) {
            console.error(err)
            res.status(500).json({ mensagem: "Erro ao ler o arquivo" })
        }
    })


})

app.get('/cursos/com-muitos-comentarios', (req, res) => {

    const minComentarios = Number(req.query.min) || 3
    fs.readFile(baseDados, 'utf-8', (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ mensagem: "Erro ao ler o arquivo" })
            return
        }

        try {
            const cursosData = JSON.parse(data)
            const cursosComMaisComentarios = cursosData.cursos.filter(curso => curso.comentarios.length >= minComentarios)
            console.log(cursosComMaisComentarios)

            res.status(200).json({ cursosComMaisComentarios })
        } catch (err) {
            console.error("Erro ao processar o arquivo", err)
            res.status(500).json({ mensagem: "Erro ao processar o arquvio" })
        }
    })
})

app.get('/usuarios/:id/cursos', (req, res) => {
    const id = parseInt(req.params.id)

    fs.readFile(baseDados, 'utf-8', (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ mensagem: "Erro ao ler o arquivo" })
            return
        }
        try {
            const baseUsuarios = JSON.parse(data)

            const usuario = baseUsuarios.usuarios.find(u => u.id === id)
            if (!usuario) {
                return res.status(404).json({ mensagem: "Usuário não encontrado" })
            }

            if (!usuario.cursos_matriculados || usuario.cursos_matriculados.length === 0) {
                return res.status(200).json({ mensagem: "O usuário não está matriculado em nenhum curso." })
            }

            res.status(200).json({ cursos: usuario.cursos_matriculados })

        } catch (err) {
            console.error(err)
            res.status(500).json({ mensagem: "Erro ao processar o arquivo" })
        }
    })
})

app.get('/usuarios/com-progresso-acima', (req, res) => {
    const comProgressoAcima = Number(req.query.min) || 80;

    fs.readFile(baseDados, 'utf-8', (err, data) => {
        if (err) {
            console.error("Erro ao ler o arquivo", err);
            return res.status(500).json({ mensagem: "Erro ao ler o arquivo" });
        }

        try {
            const baseDadosObj = JSON.parse(data);
            const baseUsuarios = baseDadosObj.usuarios;

            const usuariosFiltrados = baseUsuarios.filter(usuario =>
                usuario.progresso &&
                Object.values(usuario.progresso).some(p => p >= comProgressoAcima)
            );

            res.status(200).json({ usuarios: usuariosFiltrados });
        } catch (err) {
            console.error("Erro ao processar o arquivo", err);
            res.status(500).json({ mensagem: "Erro ao processar o arquivo" });
        }
    });
});

// GET 
// → Retorna todos os comentários feitos por um usuário específico.

app.get('/usuarios/:id/comentarios', (req, res) => {
    const id = parseInt(req.params.id)

    fs.readFile(baseDados, 'utf-8', (err, data) => {
        if (err) {
            console.log(err)
            res.status(500).json({ mensagem: "Erro ao listar" })
            return
        }
        try {
            const baseUsuariosComentarios = JSON.parse(data)
            const usuario = baseUsuariosComentarios.usuarios.find(u => u.id === id)

            if (!usuario) {
                return res.status(404).json({ mensagem: "Usuário não encontrado" })
            }

            if (!usuario.comentarios || usuario.comentarios.length === 0) {
                return res.status(200).json({ mensagem: "O usuário não realizou nenhum comentario!" })
            }

            res.status(200).json({ cursos: usuario.comentarios })

        } catch (err) {
            console.error(err)
            res.status(500).json({ mensagem: "Erro ao processar o arquivo" })
        }
    })
})
app.listen(PORT, () => {
    console.log('Servidor iniciado na porta', PORT)
})




const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const { Boom } = require("@hapi/boom")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    
    const sock = makeWASocket({ 
        auth: state,
        printQRInTerminal: true,
        browser: ["Belen Bot", "Chrome", "1.0"]
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut)
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('Bot bağlandı! 7/24 aktif')
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        const from = msg.key.remoteJid
        
        console.log('Mesaj geldi:', text)

        if (text.toLowerCase() === 'selam bot') {
            await sock.sendMessage(from, { text: 'Aleyküm selam kanka! Ben buradayım 😎' })
        }
        if (text === '!herkes') {
            try {
                const group = await sock.groupMetadata(from)
                const mentions = group.participants.map(p => p.id)
                await sock.sendMessage(from, { text: 'Herkes toplansın! @', mentions })
            } catch {}
        }
    })
}
startBot()

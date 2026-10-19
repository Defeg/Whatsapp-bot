const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({ 
        auth: state,
        printQRInTerminal: true
    })
    
    sock.ev.on('creds.update', saveCreds)

    // Telefon numarası ile eşleştirme kodu isteyeceğiz
    if (!sock.authState.creds.registered) {
        const phoneNumber = "90531475053"" // <-- BURAYA KENDİ NUMARANIN BAŞINA 90 KOYARAK YAZ
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber)
            console.log("EŞLEŞTİRME KODUN: " + code)
        }, 3000)
    }

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        const from = msg.key.remoteJid

        if (text.toLowerCase() === 'selam bot') {
            await sock.sendMessage(from, { text: 'Aleyküm selam! 7/24 buradayım kanka 😎' })
        }
    })
    
    sock.ev.on('connection.update', (u) => {
        if(u.connection === 'open') console.log('Bağlandı! Bot aktif')
    })
}
startBot()

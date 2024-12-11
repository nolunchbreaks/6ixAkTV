const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const logging = require('console');

dotenv.config();

// Replace with your actual bot token
const BOT_TOKEN = process.env.BOT_TOKEN;

// Create a new bot instance with polling
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Initialize Express server
const app = express();
app.use(bodyParser.json());

// Logging configuration
logging.log("Bot is starting...");

// Staff layout message
const STAFF_LAYOUT = ` 
<b>GROUP STAFF</b>

👑 <b>Founder</b>
└ @Sixademiks

⚜️ <b>Verified Vendors</b>
├ @Vendor1 (City1)
├ @Vendor2 (City2)
└ @Vendor3 (City3)

👮 <b>Admin</b>
├ @Maddog1212
├ @Sixademiks
├ @tuttiman
├ @Aappo666
├ @vividotcom
├ @Getbent_6
├ @Admin7
└ @Admin8
`;

// List of racial slurs to monitor
const RACIAL_SLURS = ['nigger', 'coon'];

// Check for racial slurs in a message safely
function checkForRacialSlurs(message) {
  if (!message) return false; // Handle undefined messages safely
  return RACIAL_SLURS.some(slur => message.toLowerCase().includes(slur));
}

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  try {
    const welcomeMessage = `
<b>Welcome to the DirtyNewz Bot!</b>

Please read the <b>pinned messages</b> for the group rules. 
We want to stress and urge the fact that this group has <b>zero tolerance</b> for revenge porn or any similar behavior. Violations of this rule will result in immediate restriction.

Thank you for understanding and cooperating.
    `;
    await bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'HTML' });
  } catch (error) {
    logging.error("Error in /start:", error);
  }
});

// Handle messages with racial slurs by restricting members
bot.on('message', async (msg) => {
  if (!msg.chat || !msg.from) return;

  if (checkForRacialSlurs(msg.text)) {
    try {
      if (msg.chat.id && msg.from.id) {
        await bot.restrictChatMember(msg.chat.id, msg.from.id, {
          permissions: {
            can_send_messages: false,
            can_send_media_messages: false,
            can_send_polls: false,
            can_send_other_messages: false,
            can_add_web_page_previews: false,
            can_change_info: false,
            can_invite_users: false,
            can_pin_messages: false,
          },
        });

        await bot.sendMessage(
          msg.chat.id,
          'You have been restricted for violating the community guidelines by using racial slurs.'
        );
        logging.log('User was restricted due to violation');
      } else {
        logging.error('Failed to access chat/user IDs');
      }
    } catch (error) {
      logging.error('Error during restriction:', error);
    }
  } else {
    logging.log('Received Message: ', msg.text);
  }
});

// Set server to listen
const PORT = 3012;
app.listen(PORT, () => {
  logging.log(`Express server running on port ${PORT}`);
});

// Test if bot's methods are loaded correctly
bot.getMe().then((me) => {
  logging.log(`Bot is running as: ${me.username}`);
}).catch(error => logging.error("Error fetching bot details:", error));



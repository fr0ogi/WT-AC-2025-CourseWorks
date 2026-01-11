const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Подключаемся к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk';

// Схемы моделей
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const queueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const agentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  queues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Queue' }],
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  queue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue' },
  messages: [{
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ratingSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  score: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Queue = mongoose.models.Queue || mongoose.model('Queue', queueSchema);
const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
const Rating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);

async function seed() {
  try {
    console.log('🌱 Начинаю сидирование базы данных...');
    
    // Подключение к БД
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Подключение к MongoDB успешно');

    // Очистка существующих данных
    await User.deleteMany({});
    await Queue.deleteMany({});
    await Agent.deleteMany({});
    await Ticket.deleteMany({});
    await Rating.deleteMany({});
    console.log('🗑️  База данных очищена');

    // Хеширование паролей
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Создание пользователей
    const users = await User.insertMany([
      {
        email: 'admin@helpdesk.com',
        name: 'Администратор',
        password: hashedPassword,
        role: 'admin',
      },
      {
        email: 'agent1@helpdesk.com',
        name: 'Иван Агентов',
        password: hashedPassword,
        role: 'agent',
      },
      {
        email: 'agent2@helpdesk.com',
        name: 'Мария Поддержкина',
        password: hashedPassword,
        role: 'agent',
      },
      {
        email: 'user1@example.com',
        name: 'Петр Клиентов',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'user2@example.com',
        name: 'Анна Пользователева',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'user3@example.com',
        name: 'Сергей Тестеров',
        password: hashedPassword,
        role: 'user',
      },
    ]);
    console.log(`✅ Создано ${users.length} пользователей`);

    const [admin, agent1User, agent2User, user1, user2, user3] = users;

    // 2. Создание очередей
    const queues = await Queue.insertMany([
      {
        name: 'Техническая поддержка',
        description: 'Проблемы с техникой и оборудованием',
      },
      {
        name: 'Биллинг',
        description: 'Вопросы по оплате и финансам',
      },
      {
        name: 'Общие вопросы',
        description: 'Общая информация и консультации',
      },
    ]);
    console.log(`✅ Создано ${queues.length} очередей`);

    const [techQueue, billingQueue, generalQueue] = queues;

    // 3. Создание агентов
    const agents = await Agent.insertMany([
      {
        user: agent1User._id,
        queues: [techQueue._id, generalQueue._id],
      },
      {
        user: agent2User._id,
        queues: [billingQueue._id, generalQueue._id],
      },
    ]);
    console.log(`✅ Создано ${agents.length} агентов`);

    const [agent1, agent2] = agents;

    // 4. Создание тикетов
    const tickets = await Ticket.insertMany([
      // Открытые тикеты
      {
        title: 'Не работает интернет',
        description: 'Помогите, пропал интернет уже 2 часа. Роутер горит красным.',
        status: 'open',
        priority: 'high',
        user: user1._id,
        queue: techQueue._id,
        messages: [
          {
            text: 'Помогите, пропал интернет уже 2 часа. Роутер горит красным.',
            sender: user1._id,
          },
        ],
      },
      {
        title: 'Вопрос по счету за декабрь',
        description: 'Почему сумма в счете больше обычной?',
        status: 'open',
        priority: 'medium',
        user: user2._id,
        queue: billingQueue._id,
        messages: [
          {
            text: 'Почему сумма в счете больше обычной?',
            sender: user2._id,
          },
        ],
      },
      {
        title: 'Как подключить новую услугу?',
        description: 'Интересует подключение пакета "Премиум"',
        status: 'open',
        priority: 'low',
        user: user3._id,
        queue: generalQueue._id,
        messages: [
          {
            text: 'Интересует подключение пакета "Премиум"',
            sender: user3._id,
          },
        ],
      },
      // Тикеты в работе
      {
        title: 'Медленная скорость загрузки',
        description: 'Скорость интернета упала до 10 Мбит/с вместо 100',
        status: 'in_progress',
        priority: 'medium',
        user: user1._id,
        agent: agent1._id,
        queue: techQueue._id,
        messages: [
          {
            text: 'Скорость интернета упала до 10 Мбит/с вместо 100',
            sender: user1._id,
          },
          {
            text: 'Здравствуйте! Проверяю линию, сейчас решим проблему.',
            sender: agent1User._id,
          },
        ],
      },
      {
        title: 'Не пришла квитанция',
        description: 'Обычно квитанция приходит на email, но в этом месяце не получил',
        status: 'in_progress',
        priority: 'low',
        user: user2._id,
        agent: agent2._id,
        queue: billingQueue._id,
        messages: [
          {
            text: 'Обычно квитанция приходит на email, но в этом месяце не получил',
            sender: user2._id,
          },
          {
            text: 'Проверяю систему рассылки, минутку.',
            sender: agent2User._id,
          },
        ],
      },
      // Закрытые тикеты
      {
        title: 'Ошибка при входе в личный кабинет',
        description: 'Не могу войти, пишет "неверный пароль"',
        status: 'closed',
        priority: 'high',
        user: user3._id,
        agent: agent1._id,
        queue: techQueue._id,
        messages: [
          {
            text: 'Не могу войти, пишет "неверный пароль"',
            sender: user3._id,
          },
          {
            text: 'Отправил ссылку для сброса пароля на ваш email',
            sender: agent1User._id,
          },
          {
            text: 'Спасибо, теперь всё работает!',
            sender: user3._id,
          },
        ],
      },
      {
        title: 'Консультация по тарифам',
        description: 'Хочу сменить тариф на более выгодный',
        status: 'closed',
        priority: 'low',
        user: user1._id,
        agent: agent2._id,
        queue: generalQueue._id,
        messages: [
          {
            text: 'Хочу сменить тариф на более выгодный',
            sender: user1._id,
          },
          {
            text: 'Рекомендую тариф "Оптимальный" - 500р/мес за 200 Мбит/с',
            sender: agent2User._id,
          },
          {
            text: 'Отлично, подключите пожалуйста!',
            sender: user1._id,
          },
        ],
      },
    ]);
    console.log(`✅ Создано ${tickets.length} тикетов`);

    // 5. Создание рейтингов для закрытых тикетов
    const closedTickets = tickets.filter(t => t.status === 'closed');
    const ratings = await Rating.insertMany([
      {
        ticket: closedTickets[0]._id,
        user: user3._id,
        agent: agent1._id,
        score: 5,
        comment: 'Отличная работа! Быстро помогли решить проблему.',
      },
      {
        ticket: closedTickets[1]._id,
        user: user1._id,
        agent: agent2._id,
        score: 4,
        comment: 'Хорошо, но хотелось бы побыстрее.',
      },
    ]);
    console.log(`✅ Создано ${ratings.length} рейтингов`);

    console.log('\n🎉 Сидирование завершено успешно!');
    console.log('\n📋 Данные для входа:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍💼 Администратор:');
    console.log('   Email: admin@helpdesk.com');
    console.log('   Пароль: password123');
    console.log('\n👤 Агенты:');
    console.log('   Email: agent1@helpdesk.com / Пароль: password123');
    console.log('   Email: agent2@helpdesk.com / Пароль: password123');
    console.log('\n👥 Пользователи:');
    console.log('   Email: user1@example.com / Пароль: password123');
    console.log('   Email: user2@example.com / Пароль: password123');
    console.log('   Email: user3@example.com / Пароль: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Соединение с БД закрыто');
    
  } catch (error) {
    console.error('❌ Ошибка при сидировании:', error);
    process.exit(1);
  }
}

// Запуск
seed();

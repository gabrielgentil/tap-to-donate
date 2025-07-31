print('Inicializando banco de dados de doações...');

db = db.getSiblingDB('donations');

db.createCollection('campaigns');
db.createCollection('donations');

db.campaigns.createIndex({ "campaignId": 1 }, { unique: true });
db.donations.createIndex({ "campaignId": 1 });
db.donations.createIndex({ "donatedAt": -1 });

db.campaigns.insertMany([
  {
    campaignId: "camp-001",
    name: "Campanha Bairro X",
    totalDonations: 150.00,
    collectorName: "Joana Silva",
    createdAt: new Date("2025-01-01T10:00:00Z"),
    updatedAt: new Date("2025-01-31T15:30:00Z")
  },
  {
    campaignId: "camp-002", 
    name: "Ajuda para Família Y",
    totalDonations: 75.50,
    collectorName: "Carlos Santos",
    createdAt: new Date("2025-01-15T14:00:00Z"),
    updatedAt: new Date("2025-01-30T09:15:00Z")
  }
]);

db.donations.insertMany([
  {
    campaignId: "camp-001",
    amount: 50.00,
    donorName: "Gabriel Gentil",
    paymentMethod: "credit_card",
    donatedAt: new Date("2025-01-31T10:30:00Z")
  },
  {
    campaignId: "camp-001",
    amount: 100.00,
    donorName: "Maria Silva",
    paymentMethod: "pix",
    donatedAt: new Date("2025-01-31T11:45:00Z")
  },
  {
    campaignId: "camp-002",
    amount: 25.50,
    donorName: "João Pereira",
    paymentMethod: "bank_transfer",
    donatedAt: new Date("2025-01-30T09:15:00Z")
  },
  {
    campaignId: "camp-002",
    amount: 50.00,
    donorName: "Ana Costa",
    paymentMethod: "credit_card",
    donatedAt: new Date("2025-01-30T14:20:00Z")
  }
]);

print('Banco de dados inicializado com sucesso!');
print('Dados de exemplo inseridos:');
print('- 2 campanhas');
print('- 4 doações');
print('');
print('Credenciais de acesso:');
print('- Usuário: admin');
print('- Senha: password123');
print('- Database: donations');
print('');
print('Para acessar o MongoDB via linha de comando:');
print('docker exec -it tap-to-donate-mongodb mongosh -u admin -p password123 --authenticationDatabase admin donations'); 
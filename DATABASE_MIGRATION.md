# Database Migration Required

When deploying these changes, you need to run the following SQL migration to add the `ownerId` column to the OrderItems table.

## SQL Migration

```sql
-- Add ownerId column to OrderItems table if it doesn't exist
ALTER TABLE OrderItems ADD COLUMN ownerId INT NOT NULL DEFAULT 1;

-- Add foreign key constraint
ALTER TABLE OrderItems ADD CONSTRAINT fk_orderitems_owner FOREIGN KEY (ownerId) REFERENCES Users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX idx_orderitems_ownerId_marketplaceType ON OrderItems(ownerId, marketplaceType);
CREATE INDEX idx_orderitems_paymentStatus ON OrderItems(paymentStatus);
```

## Sequelize Alternative

If you have Sequelize database syncing enabled, the migration will happen automatically when you restart the server. Make sure `sequelize.sync({ alter: true })` is called in your server startup.

## How to Apply

### Option 1: Direct Database Access
1. Connect to your database (MySQL, PostgreSQL, etc.)
2. Run the SQL commands above

### Option 2: Using Sequelize CLI
1. Create a migration file:
   ```bash
   npx sequelize migration:generate --name add-ownerId-to-orderitems
   ```

2. Edit the migration file and add:
   ```javascript
   module.exports = {
     up: async (queryInterface, Sequelize) => {
       await queryInterface.addColumn('OrderItems', 'ownerId', {
         type: Sequelize.INTEGER,
         allowNull: false,
         defaultValue: 1,
         references: {
           model: 'Users',
           key: 'id',
         },
         onDelete: 'CASCADE',
       });
       
       await queryInterface.addIndex('OrderItems', ['ownerId', 'marketplaceType']);
       await queryInterface.addIndex('OrderItems', ['paymentStatus']);
     },
     down: async (queryInterface, Sequelize) => {
       await queryInterface.removeColumn('OrderItems', 'ownerId');
     },
   };
   ```

3. Run:
   ```bash
   npx sequelize db:migrate
   ```

### Option 3: Sequelize Auto-Sync
If you're using development mode with auto-sync:
```javascript
// In server.js
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced with alter: true');
});
```

## Verification

After migration, verify the column was added:
```sql
DESCRIBE OrderItems;
-- or for PostgreSQL:
\d OrderItems;
```

You should see the `ownerId` column in the table.

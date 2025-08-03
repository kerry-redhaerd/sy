const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// 跨域配置 - 允许所有来源访问
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());
app.use(express.static('public'));

// 初始化数据文件（如果不存在则创建）
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  console.log('数据文件已初始化');
}

// 读取所有用户
app.get('/users', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      console.error('读取数据错误:', err);
      return res.status(500).send('读取数据失败');
    }
    try {
      const users = JSON.parse(data);
      res.json(users);
    } catch (parseErr) {
      console.error('解析数据错误:', parseErr);
      res.status(500).send('数据解析失败');
    }
  });
});

// 添加新用户
app.post('/users', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      console.error('读取数据错误:', err);
      return res.status(500).send('读取数据失败');
    }
    
    try {
      const users = JSON.parse(data);
      const newUser = {
        id: Date.now(), // 使用时间戳作为唯一ID
       ...req.body
      };
      
      // 确保roles字段存在
      if (!newUser.roles) {
        newUser.roles = [];
      }
      
      users.push(newUser);
      
      fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.error('写入数据错误:', err);
          return res.status(500).send('保存数据失败');
        }
        res.status(201).json(newUser);
      });
    } catch (parseErr) {
      console.error('解析数据错误:', parseErr);
      res.status(500).send('数据解析失败');
    }
  });
});

// 删除用户
app.delete('/users/:id', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      console.error('读取数据错误:', err);
      return res.status(500).send('读取数据失败');
    }
    
    try {
      let users = JSON.parse(data);
      const userId = parseInt(req.params.id);
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return res.status(404).send('用户不存在');
      }
      
      users = users.filter(user => user.id!== userId);
      
      fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.error('写入数据错误:', err);
          return res.status(500).send('保存数据失败');
        }
        res.status(200).send('用户已删除');
      });
    } catch (parseErr) {
      console.error('解析数据错误:', parseErr);
      res.status(500).send('数据解析失败');
    }
  });
});

// 为用户添加角色
app.post('/users/:userId/roles', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      console.error('读取数据错误:', err);
      return res.status(500).send('读取数据失败');
    }
    
    try {
      const users = JSON.parse(data);
      const userId = parseInt(req.params.userId);
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).send('用户不存在');
      }
      
      // 确保角色数组存在
      if (!user.roles) {
        user.roles = [];
      }
      
      const newRole = {
        id: Date.now(), // 使用时间戳作为唯一ID
       ...req.body
      };
      
      user.roles.push(newRole);
      
      fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.error('写入数据错误:', err);
          return res.status(500).send('保存数据失败');
        }
        res.status(201).json(newRole);
      });
    } catch (parseErr) {
      console.error('解析数据错误:', parseErr);
      res.status(500).send('数据解析失败');
    }
  });
});

// 更新角色
app.put('/users/:userId/roles/:roleId', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      console.error('读取数据错误:', err);
      return res.status(500).send('读取数据失败');
    }
    
    try {
      const users = JSON.parse(data);
      const userId = parseInt(req.params.userId);
      const roleId = parseInt(req.params.roleId);
      
      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).send('用户不存在');
      }
      
      const role = user.roles.find(r => r.id === roleId);
      if (!role) {
        return res.status(404).send('角色不存在');
      }
      
      // 更新角色信息
      Object.assign(role, req.body);
      
      fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.error('写入数据错误:', err);
          return res.status(500).send('保存数据失败');
        }
        res.status(200).json(role);
      });
    } catch (parseErr) {
      console.error('解析数据错误:', parseErr);
      res.status(500).send('数据解析失败');
    }
  });
});

// 删除角色
app.delete('/users/:userId/roles/:roleId', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      console.error('读取数据错误:', err);
      return res.status(500).send('读取数据失败');
    }
    
    try {
      const users = JSON.parse(data);
      const userId = parseInt(req.params.userId);
      const roleId = parseInt(req.params.roleId);
      
      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).send('用户不存在');
      }
      
      if (!user.roles) {
        user.roles = [];
      }
      
      const initialLength = user.roles.length;
      user.roles = user.roles.filter(r => r.id!== roleId);
      
      // 检查角色是否存在
      if (user.roles.length === initialLength) {
        return res.status(404).send('角色不存在');
      }
      
      fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.error('写入数据错误:', err);
          return res.status(500).send('保存数据失败');
        }
        res.status(200).send('角色已删除');
      });
    } catch (parseErr) {
      console.error('解析数据错误:', parseErr);
      res.status(500).send('数据解析失败');
    }
  });
});

// 根路径访问前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器已启动，运行在 http://localhost:${PORT}`);
  console.log(`数据文件路径: ${DATA_FILE}`);
});
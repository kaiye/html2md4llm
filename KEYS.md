# Plugin Signature Keys

## 密钥管理说明

### 文件说明

- **`html2md4llm.public.pem`** - 公钥（可安全分享）
  - 用于验证插件签名
  - 可上传到 Dify 配置中
  - 可以提交到 Git

- **`html2md4llm.private.pem`** - 私钥（必须保管好）
  - 用于签名插件
  - **不能提交到 Git**（已在 .gitignore 中）
  - 如果泄露，需要重新生成密钥对

### 生成方式

使用 Python cryptography 库生成的 RSA 2048-bit 密钥对：

```bash
python3 << 'EOF'
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

# 生成私钥
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
    backend=default_backend()
)

# 保存私钥
with open('html2md4llm.private.pem', 'wb') as f:
    f.write(private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ))

# 保存公钥
with open('html2md4llm.public.pem', 'wb') as f:
    f.write(private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ))
EOF
```

### 签名过程

```bash
python3 << 'EOF'
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import base64

# 加载私钥
with open('html2md4llm.private.pem', 'rb') as f:
    private_key = serialization.load_pem_private_key(
        f.read(),
        password=None,
        backend=default_backend()
    )

# 读取插件文件
with open('dist/html2md4llm-1.0.0.difypkg', 'rb') as f:
    plugin_data = f.read()

# 签名
signature = private_key.sign(
    plugin_data,
    padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH
    ),
    hashes.SHA256()
)

# 保存签名
with open('dist/html2md4llm-1.0.0.difypkg.signature', 'w') as f:
    f.write(base64.b64encode(signature).decode('utf-8'))
EOF
```

### 验证过程

```bash
python3 << 'EOF'
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import base64

# 加载公钥
with open('html2md4llm.public.pem', 'rb') as f:
    public_key = serialization.load_pem_public_key(
        f.read(),
        backend=default_backend()
    )

# 读取签名
with open('dist/html2md4llm-1.0.0.difypkg.signature', 'r') as f:
    signature = base64.b64decode(f.read())

# 读取插件文件
with open('dist/html2md4llm-1.0.0.difypkg', 'rb') as f:
    plugin_data = f.read()

# 验证
try:
    public_key.verify(
        signature,
        plugin_data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    print("✓ Signature is valid!")
except Exception as e:
    print(f"✗ Signature verification failed: {e}")
EOF
```

## 安全建议

1. **永不共享私钥**
   - 不要通过邮件、Slack 等方式发送
   - 不要提交到 Git（已配置 .gitignore）
   - 只在本地安全存储

2. **公钥可以安全分享**
   - 上传到 Dify
   - 提交到 Git
   - 与团队分享用于验证

3. **密钥轮换**
   - 如果私钥泄露，立即重新生成密钥对
   - 通知 Dify 更新公钥
   - 旧签名的插件需要重新签名

4. **备份**
   - 在安全的地方保存私钥备份
   - 例如加密的云存储
   - 不要在 GitHub、GitLab 等公开地方

## 常见问题

### Q: 私钥文件丢失了怎么办？
A: 重新生成新的密钥对，然后用新私钥重新签名所有插件。

### Q: 能否使用密码保护私钥？
A: 可以，将上面代码中的 `NoEncryption()` 改为 `BestAvailableEncryption(b'your_password')`。

### Q: 如何更换为生产环境的密钥？
A: 生成新的密钥对，使用生产私钥重新签名，上传到 Dify 的生产环境。

### Q: 签名过程自动化吗？
A: 可以，在 CI/CD 流程中调用签名脚本。参考 `.github/workflows/` 配置。

## 相关文档

- [Dify 插件签名文档](https://docs.dify.ai/en/plugins/publish-plugins/signing-plugins-for-third-party-signature-verification)
- [Python cryptography 库](https://cryptography.io/)
- [RSA 签名标准](https://en.wikipedia.org/wiki/RSA_(cryptosystem))

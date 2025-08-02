# PillPal - AI-Powered Healthcare Assistant

🏥 **PillPal** is a full-stack healthcare assistant that helps users analyze symptoms and explore treatment options using AI-powered insights.

## ✨ Features

- **Symptom Analysis**: Input symptoms via interactive tags or custom text
- **AI-Powered Diagnosis**: Uses AdaptLLM/medicine-chat model via HuggingFace API
- **Treatment Suggestions**: Displays OTC medications, prescriptions, and home remedies
- **Responsive Design**: Mobile-friendly interface with calming healthcare colors
- **Safety First**: Comprehensive medical disclaimers and warnings

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI Integration**: HuggingFace Inference API
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- HuggingFace API key (free tier available)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PillPal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your HuggingFace API key:
   ```
   HUGGINGFACE_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Getting HuggingFace API Key

1. Visit [HuggingFace](https://huggingface.co/)
2. Create a free account
3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token with "Read" permissions
5. Copy the token to your `.env.local` file

## 📱 Usage

1. **Enter Symptoms**: Select from predefined symptoms or add custom ones
2. **Get Analysis**: Click "Find Possible Conditions" to analyze symptoms
3. **View Results**: Browse the list of possible diseases
4. **Explore Treatments**: Click on any disease to see treatment options

## 🏗️ Project Structure

```
PillPal/
├── app/
│   ├── api/analyze/          # HuggingFace API integration
│   ├── results/              # Disease results page
│   ├── treatment/[disease]/  # Treatment details page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── public/                   # Static assets
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## ⚠️ Important Disclaimers

- **Not Medical Advice**: This app is for informational purposes only
- **Consult Professionals**: Always seek professional medical advice
- **Emergency Situations**: For severe symptoms, contact emergency services
- **AI Limitations**: AI responses may not always be accurate

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your `HUGGINGFACE_API_KEY` in Vercel's environment variables
4. Deploy automatically

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🛡️ Security

- API keys are stored securely in environment variables
- No user data is stored or tracked
- All API calls are made server-side
- HTTPS recommended for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Ensure your API key is correctly configured
3. Verify all dependencies are installed
4. Check the console for error messages

## 🔮 Future Enhancements

- [ ] User accounts and symptom history
- [ ] Integration with multiple AI models
- [ ] Symptom severity tracking
- [ ] Multi-language support
- [ ] Doctor appointment booking
- [ ] Medication interaction checker

---

**⚕️ Remember: This tool is designed to supplement, not replace, professional medical advice. Always consult with healthcare providers for proper diagnosis and treatment.**

import { useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'

const NOTE =
  'Finora works locally without an account. Once you add Supabase credentials and restart the dev server, you can create a free account and sign in from any browser. Your data then lives on your Supabase project.'

const App = ({ signUp, signIn, error }) => {
  const [isLogin, setIsLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setMessage('')
    setShowPassword(false)
    setShowConfirm(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const email = (form.email || '').trim()
    const password = (form.password || '').trim()

    if (!isLogin && form.password !== form.confirmPassword) {
      setMessage('Passwords do not match!')
      return
    }

    setMessage('')
    if (isLogin) {
      signIn({ email, password })
    } else {
      signUp({ email, password, name: (form.name || '').trim() })
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        .auth-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px 15px;
          background:
            radial-gradient(circle at 10% 15%, #172b91, transparent 35%),
            radial-gradient(circle at 90% 85%, #182a99, transparent 35%),
            linear-gradient(135deg, #020817, #071944, #080d2c);
        }

        .auth-card {
          width: 100%;
          max-width: 1050px;
          min-height: 560px;
          display: grid;
          grid-template-columns: .85fr 1.15fr;
          overflow: hidden;
          border: 1px solid rgba(80,150,255,.45);
          border-radius: 25px;
          background: rgba(12,27,67,.78);
          box-shadow: 0 0 50px rgba(25,100,255,.2);
          backdrop-filter: blur(20px);
        }

        .left-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
          border-right: 1px solid rgba(100,150,255,.18);
          background: linear-gradient(145deg,rgba(29,65,160,.25),transparent);
        }

        .logo {
          font-size: 43px;
          font-weight: 800;
          letter-spacing: -2px;
          background: linear-gradient(90deg,#35d9ff,#6475ff,#bc65ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .tagline {
          margin-top: 12px;
          color: #aabce9;
          font-size: 14px;
        }

        .illustration {
          width: 180px;
          height: 180px;
          margin: 45px 0 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 35px;
          font-size: 85px;
          background: linear-gradient(145deg,#164bd2,#7128ce);
          box-shadow: 0 0 45px rgba(48,116,255,.4);
          transform: rotate(-8deg);
        }

        .right-panel {
          padding: 55px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand {
          font-size: 37px;
          font-weight: 800;
          color: white;
          margin-bottom: 12px;
        }

        .subtitle {
          color: #c5d3f7;
          font-size: 20px;
          margin-bottom: 30px;
          font-weight: 600;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .input-group label {
          font-size: 13px;
          color: #b5c6f0;
        }

        .input-group input {
          width: 100%;
          height: 51px;
          padding: 0 17px;
          border-radius: 14px;
          outline: none;
          border: 1px solid #415a9b;
          background: rgba(42,63,112,.55);
          color: white;
          font-size: 14px;
          transition: .3s;
        }

        .input-group input:focus {
          border-color: #25baff;
          box-shadow: 0 0 15px rgba(37,186,255,.2);
        }

        .input-group input::placeholder {
          color: #8498c9;
        }

        .password-box {
          position: relative;
        }

        .password-box input {
          padding-right: 65px;
        }

        .password-box button {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #28caff;
          cursor: pointer;
          font-size: 12px;
        }

        .submit-btn {
          width: 100%;
          height: 55px;
          margin-top: 10px;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          color: white;
          font-size: 16px;
          font-weight: 700;
          background: linear-gradient(100deg,#20c8f5,#3566ff,#a43cf4);
          box-shadow: 0 8px 25px rgba(57,100,255,.3);
          transition: .3s;
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(57,100,255,.5);
        }

        .switch-text {
          text-align: center;
          margin-top: 25px;
          color: #aebee7;
          font-size: 13px;
        }

        .switch-text button {
          margin-left: 6px;
          border: none;
          background: none;
          color: #28caff;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
        }

        .message {
          margin-top: 15px;
          font-size: 13px;
          color: #56e5b1;
          text-align: center;
        }

        .message.err {
          color: #f87171;
        }

        .auth-note {
          color: #9fb3df;
          font-size: 13px;
          text-align: center;
          margin-top: 12px;
        }

        @media(max-width:750px) {
          .auth-card {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .left-panel {
            padding: 25px;
            border-right: none;
            border-bottom: 1px solid rgba(100,150,255,.18);
          }

          .logo {
            font-size: 34px;
          }

          .illustration {
            width: 95px;
            height: 95px;
            margin: 20px 0 10px;
            font-size: 48px;
          }

          .right-panel {
            padding: 35px 25px;
          }
        }

        @media(max-width:380px) {
          .brand {
            font-size: 30px;
          }

          .subtitle {
            font-size: 17px;
          }
        }
      `}</style>

      {!isSupabaseConfigured ? (
        <div className="auth-container">
          <div className="auth-card">
            <div className="right-panel">
              <h1 className="brand">Finora</h1>
              <h2 className="subtitle">Start using Finora</h2>
              <p className="auth-note">
                Supabase is not configured yet — add credentials to <code>.env</code> and restart the dev server to sign up and log in.
              </p>
              <p className="auth-note">{NOTE}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-container">
          <div className="auth-card">

            {/* LEFT PANEL */}
            <div className="left-panel">
              <h1 className="logo">Finora.</h1>

              <p className="tagline">
                Manage your finances smarter.
              </p>

              <div className="illustration">
                {isLogin ? "🔐" : "📊"}
              </div>

              <p className="tagline">
                Smart Money. Better Future.
              </p>
            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">

              <h1 className="brand">Finora</h1>

              <h2 className="subtitle">
                {isLogin
                  ? "Sign in to your account"
                  : "Create your account"}
              </h2>

              <form onSubmit={handleSubmit}>

                {!isLogin && (
                  <div className="input-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Dali"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>

                  <div className="password-box">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="input-group">
                    <label>Confirm Password</label>

                    <div className="password-box">
                      <input
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                )}

                <button className="submit-btn" type="submit">
                  {isLogin ? "Sign In →" : "Create Account →"}
                </button>

              </form>

              {(message || error) && (
                <p className={`message ${message.includes('do not match') || error ? 'err' : ''}`}>
                  {message || error}
                </p>
              )}

              <p className="switch-text">
                {isLogin
                  ? "New here?"
                  : "Already have an account?"}

                <button type="button" onClick={switchMode}>
                  {isLogin
                    ? "Create an account"
                    : "Sign in"}
                </button>
              </p>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;

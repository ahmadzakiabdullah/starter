<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maintenance in Progress</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f19;
            --text-color: #f3f4f6;
            --muted-color: #9ca3af;
            --accent-color: #3b82f6;
            --card-bg: rgba(30, 41, 59, 0.4);
            --card-border: rgba(255, 255, 255, 0.08);
            --glow-1: rgba(59, 130, 246, 0.15);
            --glow-2: rgba(147, 51, 234, 0.15);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
            padding: 1.5rem;
        }

        /* Ambient Glow Backgrounds */
        .glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            z-index: 1;
            pointer-events: none;
        }

        .glow-1 {
            width: 400px;
            height: 400px;
            background: var(--glow-1);
            top: -100px;
            left: -100px;
            animation: float-glow 10s ease-in-out infinite alternate;
        }

        .glow-2 {
            width: 450px;
            height: 450px;
            background: var(--glow-2);
            bottom: -150px;
            right: -100px;
            animation: float-glow-reverse 12s ease-in-out infinite alternate;
        }

        @keyframes float-glow {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(50px, 30px) scale(1.1); }
        }

        @keyframes float-glow-reverse {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(-60px, -40px) scale(1.15); }
        }

        /* Glassmorphic Container */
        .container {
            position: relative;
            z-index: 10;
            max-width: 550px;
            width: 100%;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            padding: 3rem 2rem;
            text-align: center;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fade-in {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Animated Icon */
        .icon-container {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 80px;
            height: 80px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.25);
            border-radius: 20px;
            margin-bottom: 2rem;
            position: relative;
        }

        .icon-svg {
            width: 38px;
            height: 38px;
            stroke: var(--accent-color);
            stroke-width: 1.5;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
            animation: pulse-gear 3s ease-in-out infinite;
        }

        @keyframes pulse-gear {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.05); }
        }

        /* Typography */
        h1 {
            font-size: 2.25rem;
            font-weight: 800;
            letter-spacing: -0.025em;
            margin-bottom: 1rem;
            background: linear-gradient(to right, #ffffff, #93c5fd);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p {
            font-size: 1.125rem;
            line-height: 1.6;
            color: var(--muted-color);
            margin-bottom: 2rem;
            font-weight: 300;
        }

        /* Badge */
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.2);
            color: #f59e0b;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1.5rem;
            animation: pulse-badge 2s infinite;
        }

        @keyframes pulse-badge {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        /* Decorative Footer */
        .footer {
            margin-top: 1rem;
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>

    <div class="container">
        <div class="badge">
            <span style="display:inline-block; width:8px; height:8px; background-color:#f59e0b; border-radius:50%;"></span>
            System Offline
        </div>
        
        <div class="icon-container">
            <svg class="icon-svg" viewBox="0 0 24 24">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        </div>

        <h1>Under Scheduled Maintenance</h1>
        <p>{{ $message }}</p>

        <div class="footer">
            Please contact support if you believe this is an error.
        </div>
    </div>
</body>
</html>

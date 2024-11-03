// page.js
import Image from 'next/image';
import styles from '../styles/LandingPage.module.css';
import './globals.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image 
            src="/newlogo.png" 
            alt="Therable Logo" 
            width={40} 
            height={40} 
            className={styles.logoIcon}
          />
        </div>
        <div className={styles.buttonGroup}> {/* New container for buttons */}
          <button className={styles.loginBtn}>Login</button>
          <button className={styles.loginBtn}>Sign Up</button> {/* New Sign Up button */}
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.textContent}>
          <h1>welcome to <span className={styles.brandName}>therable</span>.</h1>
          <h1 className={styles.textContent}>
            a curated, customizable health tool for <em>you</em>.
          </h1>
          <div className={styles.buttonContainer}>
            <button className={styles.getStartedBtn}>Get Started!</button>
          </div>
        </div>
        <div className={styles.imageContainer}>
          <Image 
            src="/mainerpick.png" 
            alt="Therapy Session Illustration" 
            width={800} 
            height={400} 
            className={styles.illustration} 
          />
        </div>
      </main>
    </div>
  );
}

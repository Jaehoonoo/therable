"use client";
import styles from "./page.module.css";
import { useEffect } from "react";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './globals.css';

export default function LandingPage() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8080/api/home")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message)
      });
  }, [])

  // create table for each user
  useEffect(() => {
    createTable(userId);
  }, [userId])


  const createTable = (userId) => {
    fetch('http://localhost:8080/api/create_table', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId }),
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById('output').textContent = data;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    }

  const handleGetStarted = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    } else {
      router.push("/diary");
    }
  }

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
        <div onClick={handleGetStarted} className ={styles.imageContainer}>
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

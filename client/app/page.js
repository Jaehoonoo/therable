"use client";
import styles from "./page.module.css";
import { useEffect } from "react";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8080/api/home")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message)
      });
  }, [])

  const handleGetStarted = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    } else {
      router.push("/diary");
    }
  }

  return (
    <div>
      <button onClick={handleGetStarted} className={styles.button}>Get Started!</button>
    </div>
  );
}

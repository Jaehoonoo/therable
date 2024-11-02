"use client";
import styles from "./page.module.css";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    fetch("http://localhost:8080/api/home")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message)
      });
  }, [])

  return (
    <div>hi</div>
  );
}

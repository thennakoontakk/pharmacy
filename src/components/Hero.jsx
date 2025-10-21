import React from 'react'
import './hero.css'
import slide1 from '../assets/coursel_1.png'
import slide2 from '../assets/coursel_2.png'
import logo from '../assets/logo.png'

export default function Hero() {
  return (
    <section className="hero" id="home">
      {/* Background carousel */}
      <div className="hero__bg" aria-hidden="true">
        <img src={slide1} alt="Background 1" className="hero__bg-img hero__bg-img--one" />
        <img src={slide2} alt="Background 2" className="hero__bg-img hero__bg-img--two" />
        <div className="hero__overlay" />
      </div>

      {/* Content */}
      <div className="hero__content">
        <div className="hero__top">
          <img src={logo} alt="Bionetro" className="hero__logo" />
          <h1 className="hero__brand-outline">BIONETRO</h1>
        </div>

        <div className="hero__grid">
          <div className="hero__left">
            <h2 className="hero__title">BIONETRO (PVT LTD)</h2>
            <p className="hero__desc">
              We strive to become the largest online cosmetics store in Sri Lanka, offering a wide range of beauty and healthcare products, including a growing selection of vegan, cruelty-free, and non-toxic items. Our mission is to deliver a unique and world-class online shopping experience to every customer.
            </p>
            
          </div>

          <div className="hero__right">
            <div className="hero__card hero__card--primary" />
            <div className="hero__card hero__card--secondary" />
          </div>
        </div>
      </div>
    </section>
  )
}
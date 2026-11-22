import React from 'react';
import Hero from '../components/Hero';
import FeatureDestination from '../components/FeatureDestination';
import ExclusiveOffers from '../components/ExclusiveOffers';
import Testimonial from '../components/Testimonial';
import Newsletter from '../components/NewsLetter';
import RecommendedHotels from '../components/RecommendedHotels';

const Home = () => {  return (
    <>  
    <Hero />
    <RecommendedHotels/> 
    <FeatureDestination/>
    <ExclusiveOffers/>
    <Testimonial/>
    <Newsletter/>
    
    </>
)        
}
export default Home
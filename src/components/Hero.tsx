import Image from 'next/image'

const Hero = () => {
  return (
    <div className="flex items-center justify-center h-80 w-full relative bg-fixed bg-center">
        <Image src="/finance.jpg" alt='test' fill/>
        <h2 className="relative mt-10  text-8xl text-center text-white z-10">Check Rate!</h2>
    </div>
  )
}

export default Hero
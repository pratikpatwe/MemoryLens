import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Helping People Remember Life's Important Moments
              </h1>
              <p className="text-lg md:text-xl text-slate-700">
                MemoryLens captures moments automatically and uses AI to describe events, helping those with
                memory-related challenges stay connected to their experiences.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-slate-800 hover:bg-slate-900 text-white">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src="/placeholder.svg?height=400&width=500" alt="MemoryLens Device" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          </div>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-700/20 to-transparent z-10"></div>
                <img
                  src="/placeholder.svg?height=300&width=400"
                  alt="Our Mission"
                  className="rounded-xl w-full h-auto"
                />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-semibold text-slate-900">Empowering Memory Through Technology</h3>
                <p className="text-slate-700">
                  At MemoryLens, we believe everyone deserves to hold onto their precious memories. Our mission is to
                  leverage cutting-edge IoT and AI technology to help individuals with memory-related challenges
                  maintain their connection to daily experiences and important moments.
                </p>
                <p className="text-slate-700">
                  We're committed to creating accessible, intuitive technology that seamlessly integrates into daily
                  life, providing peace of mind to users and their loved ones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Section */}
      <section id="project" className="py-20 px-4 md:px-6 lg:px-8 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Project</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <h3 className="text-2xl font-semibold text-slate-900">How MemoryLens Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="font-semibold text-slate-700">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Automatic Capture</h4>
                    <p className="text-slate-700">The device captures images at set intervals throughout the day.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="font-semibold text-slate-700">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Secure Upload</h4>
                    <p className="text-slate-700">Images are securely uploaded to our servers for processing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="font-semibold text-slate-700">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">AI Description</h4>
                    <p className="text-slate-700">
                      Our AI analyzes each image and generates natural language descriptions of the events.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="font-semibold text-slate-700">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Easy Access</h4>
                    <p className="text-slate-700">Users can access their memories through our intuitive mobile app.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-700/20 to-transparent z-10"></div>
                <img
                  src="/placeholder.svg?height=500&width=600"
                  alt="MemoryLens Device and App"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Team</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          </div>

          {/* Team Group Image - 16:9 ratio */}
          <div className="mb-16">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-700/20 to-transparent z-10"></div>
              <img
                src="/placeholder.svg?height=720&width=1280"
                alt="MemoryLens Team"
                className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>

          {/* Team Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { name: "Pratik Patwe", role: "FY SOC09, MIT ADT", image: "/placeholder.svg?height=300&width=300" },
              { name: "Riya Patil", role: "FY SOC09, MIT ADT", image: "/placeholder.svg?height=300&width=300" },
              { name: "Pratima Yadav", role: "FY SOC09, MIT ADT", image: "/placeholder.svg?height=300&width=300" },
              { name: "Prithvi Raj Singh", role: "FY SOC09, MIT ADT", image: "/placeholder.svg?height=300&width=300" },
              { name: "Viraj", role: "FY SOC09, MIT ADT", image: "/placeholder.svg?height=300&width=300" },
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all">
                <div className="aspect-square relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-700/10 to-transparent z-10"></div>
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-slate-600 text-sm">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor Section */}
      <section id="mentor" className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Mentor</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-700 max-w-2xl mx-auto mb-8">
              Our project is guided by an exceptional mentor who brings expertise and vision to MemoryLens.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-slate-100 transform transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-700/20 to-transparent z-10"></div>
                <img
                  src="https://ik.imagekit.io/hypjg0kzv/photo_2024-05-13_10-13-18.jpg?updatedAt=1746387688423"
                  alt="Dr. Pranav Chippalkatti"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full mb-4 w-fit">
                  Lead Mentor
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Dr. Pranav Chippalkatti</h3>
                <p className="text-slate-600 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Professor of Computer Science
                </p>
                <div className="h-1 w-16 bg-slate-200 mb-4"></div>
                <p className="text-slate-700">
                  Dr. Pranav Chippalkatti brings over 20 years of experience in AI and cognitive science to the MemoryLens project.
                  His groundbreaking research on memory augmentation technologies has been instrumental in shaping our
                  approach and technical implementation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      <Footer />
    </div>
  )
}

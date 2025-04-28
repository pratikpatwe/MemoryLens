import { Button } from "@/components/ui/button"
import ContactForm from "@/components/contact-form"
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
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
                  Get Started
                </Button>
                <Button size="lg" variant="outline">
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
            <div className="w-20 h-1 bg-slate-900 mx-auto mb-6"></div>
          </div>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
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
            <div className="w-20 h-1 bg-slate-900 mx-auto mb-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <h3 className="text-2xl font-semibold text-slate-900">How MemoryLens Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Automatic Capture</h4>
                    <p className="text-slate-700">The device captures images at set intervals throughout the day.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Secure Upload</h4>
                    <p className="text-slate-700">Images are securely uploaded to our servers for processing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="font-semibold">3</span>
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
                    <span className="font-semibold">4</span>
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
            <div className="w-20 h-1 bg-slate-900 mx-auto mb-6"></div>
          </div>

          {/* Team Group Image - 16:9 ratio */}
          <div className="mb-16">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
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
              { name: "Alex Johnson", role: "Project Lead", image: "/placeholder.svg?height=300&width=300" },
              { name: "Sarah Chen", role: "Hardware Engineer", image: "/placeholder.svg?height=300&width=300" },
              { name: "Michael Rodriguez", role: "AI Specialist", image: "/placeholder.svg?height=300&width=300" },
              { name: "Priya Patel", role: "Software Developer", image: "/placeholder.svg?height=300&width=300" },
              { name: "David Kim", role: "UX Designer", image: "/placeholder.svg?height=300&width=300" },
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="aspect-square">
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
      <section id="mentor" className="py-20 px-4 md:px-6 lg:px-8 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Mentor</h2>
            <div className="w-20 h-1 bg-slate-900 mx-auto mb-6"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3">
                <div className="aspect-square">
                  <img
                    src="/placeholder.svg?height=400&width=400"
                    alt="Dr. Emily Watson"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Dr. Emily Watson</h3>
                <p className="text-slate-600 mb-4">Professor of Computer Science & Neuroscience</p>
                <p className="text-slate-700">
                  Dr. Watson brings over 20 years of experience in AI and cognitive science to the MemoryLens project.
                  Her groundbreaking research on memory augmentation technologies has been instrumental in shaping our
                  approach and technical implementation.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" size="sm">
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm">
                    Publications
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <div className="w-20 h-1 bg-slate-900 mx-auto mb-6"></div>
            <p className="text-slate-700 max-w-2xl mx-auto">
              Have questions about MemoryLens? We'd love to hear from you. Fill out the form below and our team will get
              back to you as soon as possible.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

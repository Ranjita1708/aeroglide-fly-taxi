import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plane, Zap, Shield, Clock } from "lucide-react";
import heroImage from "@/assets/hero-flying-taxi.jpg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-secondary/95" />
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-2 mb-6">
                <Plane className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Now Live in Bengaluru</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Skip the Traffic.
              <br />
              <span className="text-gradient">Take Flight.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Experience autonomous flying taxis across Bengaluru. Point-to-point travel in minutes, not hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate("/book")}
              >
                Book Your Flight
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Reach your destination in a fraction of the time. Direct air routes mean no traffic delays.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Autonomous & Safe</h3>
              <p className="text-muted-foreground">
                Advanced AI-powered navigation ensures the highest safety standards on every flight.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 mx-auto bg-success/10 rounded-2xl flex items-center justify-center">
                <Clock className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Always On Time</h3>
              <p className="text-muted-foreground">
                Predictable travel times with real-time tracking. Know exactly when you'll arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl sky-gradient">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Soar?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join the future of urban mobility. Book your first flight today.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/book")}
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

// ---- File: src/components/Footer.tsx ----
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-800 text-slate-300 mt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Drobble</h3>
                        <p className="text-sm text-slate-400">
                            Your one-stop shop for the best products online. Quality and customer satisfaction are our top priorities.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/search?q=" className="hover:text-white transition-colors">All Products</Link></li>
                            <li><Link to="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
                            <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Contact Us</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>Email: support@drobble.com</li>
                            <li>Phone: (123) 456-7890</li>
                            <li>Cebu City, Philippines</li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Follow Us</h4>
                        <div className="flex space-x-4">
                            <a href="#" aria-label="Facebook" className="hover:text-white transition-colors"><FaFacebook size="1.5em" /></a>
                            <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><FaTwitter size="1.5em" /></a>
                            <a href="#" aria-label="Instagram" className="hover:text-white transition-colors"><FaInstagram size="1.5em" /></a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Drobble Inc. All rights reserved. Created by Erwin Wilson Ceniza with ASP.NET Core 9 Microservices.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
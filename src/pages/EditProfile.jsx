import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

import {setEditProfileUpdatedFalse, setEditPendingFalse} from '../store/auth_store';

import { IoArrowBack } from "react-icons/io5";


import MsgBox from '../layouts/MsgBox';

import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import Stack from '@mui/material/Stack';

function EditProfile() {

    const navigate = useNavigate();
    const dispatch = useDispatch();


    const { login_pending, is_auth, user, edit_profile } = useSelector((state) => state.authSlice);


    const [formData, setFormData] = useState({
        first_name: user?.payload?.user?.profile?.first_name || '',
        middle_name: user?.payload?.user?.profile?.middle_name || '',
        last_name: user?.payload?.user?.profile?.last_name || '',
        date_of_birth: user?.payload?.user?.profile?.date_of_birth || '',
        age: user?.payload?.user?.profile?.age?.toString() || '',
        country: user?.payload?.user?.profile?.country || '',
        city: user?.payload?.user?.profile?.city || '',
        gender: user?.payload?.user?.profile?.gender || '',
        bio: user?.payload?.user?.profile?.bio || '',
        phone_number: user?.payload?.user?.profile?.phone_number || ''
    });


    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user?.payload?.user?.profile?.first_name || '',
                middle_name: user?.payload?.user?.profile?.middle_name || '',
                last_name: user?.payload?.user?.profile?.last_name || '',
                date_of_birth: user?.payload?.user?.profile?.date_of_birth || '',
                age: user?.payload?.user?.profile?.age?.toString() || '',
                country: user?.payload?.user?.profile?.country || '',
                city: user?.payload?.user?.profile?.city || '',
                gender: user?.payload?.user?.profile?.gender || '',
                bio: user?.payload?.user?.profile?.bio || '',
                phone_number: user?.payload?.user?.profile?.phone_number || ''
            })
        }
    }, [user])


    // Alternative: Using a comprehensive country list
    const countries = [
        'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola',
        'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia',
        'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh',
        'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
        'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
        'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde',
        'Cambodia', 'Cameroon', 'Canada', 'Central African Republic',
        'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
        'Congo (Congo-Brazzaville)', 'Costa Rica', 'Croatia', 'Cuba',
        'Cyprus', 'Czechia (Czech Republic)', 'Democratic Republic of the Congo',
        'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
        'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
        'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
        'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
        'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti',
        'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
        'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
        'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait',
        'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
        'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
        'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
        'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
        'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
        'Morocco', 'Mozambique', 'Myanmar (Burma)', 'Namibia', 'Nauru',
        'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
        'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
        'Pakistan', 'Palau', 'Palestine State', 'Panama', 'Papua New Guinea',
        'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
        'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
        'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
        'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
        'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
        'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
        'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden',
        'Switzerland', 'Syria', 'Tajikistan', 'Tanzania', 'Thailand',
        'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
        'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine',
        'United Arab Emirates', 'United Kingdom', 'United States of America',
        'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam',
        'Yemen', 'Zambia', 'Zimbabwe'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(AuthService.update_user(formData));
        setTimeout(() => {
            navigate('/profile');
        }, 2000);
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setFormData(prev => ({
            ...prev,
            date_of_birth: date,
            age: date ? calculateAge(date) : ''
        }));
    };

    const calculateAge = (dateString) => {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    };

    useEffect(() => {
        if (edit_profile.profile_updated) {
            setTimeout(() => {
                dispatch(setEditProfileUpdatedFalse());
                dispatch(setEditPendingFalse());
            }, 2000);
        }
    }, [edit_profile.profile_updated]);

   
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">

            <MsgBox
                message={edit_profile.edit_message}
                type="success"
                visible={edit_profile.profile_updated}
                duration={2000}
            />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 ">
                    <div className=' p-2 mb-1'>
                        <button className='flex items-center border border-gray-300 rounded-xl p-1 hover:bg-gray-50 transition-all duration-200' onClick={() => navigate('/profile')}>
                            <IoArrowBack className="text-gray-500 text-xl" />
                            <span className="text-gray-500 text-xl ml-2">Back</span>
                        </button>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                        Edit Your Profile
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Update your personal information and make your profile stand out
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Cover & Profile Images */}
                    

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="John"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    name="middle_name"
                                    value={formData.middle_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Robert"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Demographics */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                            Demographics
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleDateChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-xl text-gray-500"
                                    placeholder="Auto-calculated"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                            Location
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                </label>
                                <div className="relative">
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                                    >
                                        <option value="">Select a country</option>
                                        {countries.sort().map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                        <option value="other">Other (Please specify)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>
                                {formData.country === 'other' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Specify Country
                                        </label>
                                        <input
                                            type="text"
                                            name="country_other"
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Enter your country"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="New York"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Bio */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                                    Contact Information
                                </h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                                    Bio
                                </h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tell us about yourself
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData?.bio}
                                        onChange={handleChange}
                                        rows={5}
                                        maxLength={500}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                        placeholder="Share something interesting about yourself..."
                                    />
                                    <div className="text-right text-sm text-gray-500 mt-2">
                                        {formData?.bio?.length}/500 characters
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-4">

                        <button
                            type="button"
                            className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
                            onClick={() => setFormData({
                                first_name: '',
                                middle_name: '',
                                last_name: '',
                                date_of_birth: '',
                                age: '',
                                country: '',
                                city: '',
                                gender: '',
                                bio: '',
                                phone_number: '',
                                profile_image_url: '',
                                cover_image_url: ''
                            })}
                        >
                            Reset
                        </button>
                        {
                            !edit_profile.edit_pending ?
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Save Changes
                                </button>
                                :
                                <Button
                                    loading
                                    variant="outlined"
                                    loadingPosition="end"
                                    startIcon={<SaveIcon />}
                                >
                                    Save
                                </Button>
                        }
                    </div>
                </form>

                {/* Footer Note */}
                <div className="mt-10 text-center text-sm text-gray-500">
                    <p>* Required fields. Your profile will be visible to other users based on your privacy settings.</p>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
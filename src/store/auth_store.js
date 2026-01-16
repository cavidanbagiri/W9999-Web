import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import AuthService from '../services/AuthService.js';


const initialState = {
    user: {
        email: 'unknown',
        username: '',
        target_langs: [],
    },
    login_message: '',
    login_pending: false,
    is_auth: false,
    native_lang: '', // New Added
    choosen_lang: '', // New Added
    is_login_error: false,
    login_success: false,
    new_target_lang_cond:{
        is_cond: false,
        msg: '',
        res: null,
    },

    edit_profile:{
        edit_pending: false,
        edit_message: "",
        profile_updated: false,
    }

}

export const authSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setLoginPending: (state, action) => {
            state.login_pending = action.payload;
        },
        setIsAuth: (state, action) => {
            state.is_auth = action.payload;
        },
        setIsLoginErrorTrue: (state) => {
            state.is_login_error = true;
        },
        setIsLoginErrorFalse: (state) => {
            state.is_login_error = false;
        },
        setIsLoginSuccessFalse: (state) => {
            state.login_success = false;
        },
        setNewTargetLanguageCondFalse: (state, action) => {
            state.new_target_lang_cond.is_cond = false;
            state.new_target_lang_cond.msg = '';
        },
        setEditPendingFalse: (state) => {
            state.edit_pending = false;
        },
        setEditProfileUpdatedFalse: (state) => {
            state.edit_profile.profile_updated = false;
            state.edit_profile.edit_message = '';
            state.edit_profile.edit_pending = false;
        },
    },
    extraReducers: (builder) => {

        // Userservice register
        builder.addCase(AuthService.register.pending, (state, action) => {
            state.login_pending = true;
        })
        builder.addCase(AuthService.register.fulfilled, (state, action) => {
            state.is_auth = true;
            state.login_pending = false;
            state.user = action.payload;
            state.login_success = true;
            state.login_message = 'Successfully registered';
            state.user.target_langs = []
            localStorage.setItem('token', action.payload?.payload?.access_token);
            localStorage.setItem('sub', action.payload?.payload?.user?.sub);  
            localStorage.setItem('username', action.payload?.payload?.user?.username); 
            localStorage.setItem('image_url', action.payload?.payload?.user?.profile?.profile_image_url);
            if (action.payload.payload.user.native === null) {
                localStorage.setItem('native', '');
            }
            else {
                localStorage.setItem('native', action.payload.payload.user.native);
                state.native_lang = action.payload.payload.user.native
            }
          
        });
        builder.addCase(AuthService.register.rejected, (state, action) => {
            state.login_pending = false;
            state.is_auth = false;
            state.is_login_error = true;
            state.login_message = action.payload?.payload?.detail;
        });


        // Userservice login
        builder.addCase(AuthService.login.pending, (state, action) => {
            state.login_pending = true;
        })
        builder.addCase(AuthService.login.fulfilled, (state, action) => {
            console.log('the login action is : ', action.payload)
            state.is_auth = true;
            state.login_pending = false;
            state.user = action.payload;
            state.login_success = true;
            state.login_message = 'Successfully logged in';
            state.user.target_langs = action.payload?.payload?.user?.learning_targets || [];
            localStorage.setItem('token', action.payload?.payload?.access_token);
            localStorage.setItem('sub', action.payload?.payload?.user?.sub);  
            localStorage.setItem('username', action.payload?.payload?.user?.username); 
            localStorage.setItem('native', action.payload?.payload?.user?.native);
            localStorage.setItem('image_url', action.payload?.payload?.user?.profile?.profile_image_url);
            localStorage.target_langs = JSON.stringify(action.payload?.payload?.user?.learning_targets || []);
            if (action.payload.payload.user.native === null) {
                localStorage.setItem('native', '');
            }
            else {
                localStorage.setItem('native', action.payload.payload.user.native);
                state.native_lang = action.payload.payload.user.native
            }
        });
        builder.addCase(AuthService.login.rejected, (state, action) => {
            state.login_pending = false;
            state.is_auth = false;
            state.is_login_error = true;
            state.login_message = action.payload?.payload?.detail;

        });

        // NEW: Google Sign-In cases
        builder.addCase(AuthService.googleLogin.pending, (state, action) => {
            state.login_pending = true;
            state.is_login_error = false;
        })
        builder.addCase(AuthService.googleLogin.fulfilled, (state, action) => {
            state.is_auth = true;
            state.login_pending = false;
            state.user = action.payload;
            state.login_success = true;
            state.login_message = 'Successfully logged in with Google';
            state.user.target_langs = action.payload?.payload?.user?.learning_targets;
            localStorage.setItem('token', action.payload?.payload?.access_token);
            localStorage.setItem('sub', action.payload?.payload?.user?.sub);  
            localStorage.setItem('username', action.payload?.payload?.user?.username); 
            localStorage.setItem('native', action.payload?.payload?.user?.native);
            localStorage.setItem('image_url', action.payload?.payload?.user?.profile?.profile_image_url);
            localStorage.target_langs = JSON.stringify(action.payload?.payload?.user?.learning_targets || []);
            if (action.payload.payload.user.native === null) {
                localStorage.setItem('native', '');
                state.native_lang = '';
            } else {
                localStorage.setItem('native', action.payload?.payload?.user?.native);
                state.native_lang = action.payload.payload.user.native;
            }
        });
        builder.addCase(AuthService.googleLogin.rejected, (state, action) => {
            state.login_pending = false;
            state.is_auth = false;
            state.is_login_error = true;
            state.login_message = action.payload?.payload?.detail || 'Google login failed';
        });


        // Userservice refresh
        builder.addCase(AuthService.refresh.fulfilled, (state, action) => {
            state.is_auth = true;
            state.user = action.payload;
            localStorage.setItem('token', action.payload?.payload?.access_token);
            localStorage.setItem('sub', action?.payload?.payload?.user?.sub);
            localStorage.setItem('username', action?.payload?.payload?.user?.username);
            localStorage.setItem('image_url', action.payload?.payload?.user?.profile?.profile_image_url);

            // Get the target languages from the local storage and set them to the user object
            const target_langs = localStorage.getItem('target_langs');
            if (target_langs) {
                state.user.target_langs = JSON.parse(target_langs);
            }

        });
        builder.addCase(AuthService.refresh.rejected, (state, action) => {
            console.log('refresh second', action.payload);
        });


        // Userservice logout
        builder.addCase(AuthService.userLogout.fulfilled, (state, action) => {
            state.is_auth = false;
            state.user = null;
            state.is_login_error = false,
            state.login_success = false
            localStorage.clear();
        });

        // UserService setNativeLanguage
        builder.addCase(AuthService.setNativeLanguage.fulfilled, (state, action) => {
            state.native_lang = action.payload?.payload?.native
            localStorage.setItem('native', action.payload?.payload?.native);

        });
        builder.addCase(AuthService.setNativeLanguage.rejected, (state, action) => {
        });

        
        // UserService setChoosenLanguage
        builder.addCase(AuthService.setTargetLanguage.fulfilled, (state, action) => {
            state.choosen_lang = action.payload?.payload?.target_language_code
            state.new_target_lang_cond.is_cond = true;
            state.new_target_lang_cond.msg = action.payload?.payload?.msg; 
            const currentLangs = localStorage.getItem('target_langs');
            // get current target languages and add new one
            if (currentLangs) {
                const currentLangsArr = JSON.parse(currentLangs);
                if (currentLangsArr.includes(action.payload?.payload?.target_language_code)) {
                    return state; // already exists → no change
                }
                currentLangsArr.push(action.payload?.payload?.target_language_code);
                localStorage.setItem('target_langs', JSON.stringify(currentLangsArr));
            }
            else {
                localStorage.setItem('target_langs', JSON.stringify([action.payload?.payload?.target_language_code]));
            }
            

            state.new_target_lang_cond.res = action.payload?.payload?.target_language_code;
            const code = action.payload?.payload?.target_language_code;
            if (state.user.target_langs?.includes(code)) {
                return state; // already exists → no change
            }
            // state.user.target_langs = [...state.user.target_langs, action.payload?.payload?.target_language_code];
            const target_langs = localStorage.getItem('target_langs');
            if (target_langs) {
                state.user.target_langs = JSON.parse(target_langs);
            }


        });
        builder.addCase(AuthService.setTargetLanguage.rejected, (state, action) => {
            console.log('target rejected', action.payload);
        });


        // Edit Profile
        builder.addCase(AuthService.update_user.pending, (state, action) => {
            // state.login_pending = true;
            state.edit_profile.edit_pending = true;
        })
        builder.addCase(AuthService.update_user.fulfilled, (state, action) => {
            // state.user = action.payload;
            state.edit_profile.edit_pending = false;
            state.edit_profile.edit_message = 'Successfully updated your profile';
            state.edit_profile.profile_updated = true;
            state.user = action.payload;
            
            // console.log('update user fulfilled...................', action.payload);
        });
        builder.addCase(AuthService.update_user.rejected, (state, action) => {
            state.edit_profile.edit_pending = false;
            state.edit_profile.edit_message = action.payload?.payload?.detail;
        });

        // Edit User Image
        builder.addCase(AuthService.update_user_image.pending, (state, action) => {
            // state.login_pending = true;
            state.edit_profile.edit_pending = true;
        })
        builder.addCase(AuthService.update_user_image.fulfilled, (state, action) => {
            state.edit_profile.edit_pending = false;
            state.edit_profile.edit_message = 'Successfully updated your profile image';
            state.edit_profile.profile_updated = true;
            localStorage.setItem('image_url', action.payload?.image_url);
        });
        builder.addCase(AuthService.update_user_image.rejected, (state, action) => {
            state.edit_profile.edit_pending = false;
            state.edit_profile.edit_message = action.payload?.detail;
        });

    },
});

export const { setUser, setLoginPending, setIsAuth, setIsLoginErrorTrue, setIsLoginErrorFalse, setIsLoginSuccessFalse, setNewTargetLanguageCondFalse, setEditPendingFalse, setEditProfileUpdatedFalse } = authSlice.actions;

export default authSlice.reducer;
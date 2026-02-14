// Authentication Logic

const supabase = window.supabaseClient;

// Show message helper
function showMessage(message, type = 'error') {
    const messageEl = document.getElementById('auth-message') || createMessageElement();
    messageEl.textContent = message;
    messageEl.className = `message ${type} show`;

    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

function createMessageElement() {
    const messageEl = document.createElement('div');
    messageEl.id = 'auth-message';
    messageEl.className = 'message';
    const form = document.getElementById('signin-form');
    form.parentNode.insertBefore(messageEl, form);
    return messageEl;
}

// Google Sign In
document.getElementById('google-signin-btn')?.addEventListener('click', async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard.html'
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error('Google sign in error:', error);
        showMessage(error.message || 'Failed to sign in with Google', 'error');
    }
});

// Email/Password Sign In
document.getElementById('signin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Success - redirect to dashboard
        showMessage('Sign in successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        console.error('Sign in error:', error);
        showMessage(error.message || 'Failed to sign in', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Sign Up Form (for signup.html)
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Validate passwords match
    if (confirmPassword && password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin + '/dashboard.html'
            }
        });

        if (error) throw error;

        showMessage('Account created! Please check your email to verify your account.', 'success');

        // Clear form
        e.target.reset();

    } catch (error) {
        console.error('Sign up error:', error);
        showMessage(error.message || 'Failed to create account', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Check if user is already logged in
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // User is logged in
        const currentPage = window.location.pathname;
        if (currentPage.includes('login.html') || currentPage.includes('signup.html')) {
            // Redirect to dashboard if on auth pages
            window.location.href = 'dashboard.html';
        }
    }
}

// Run auth check on page load
checkAuth();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);

    if (event === 'SIGNED_IN') {
        window.location.href = 'dashboard.html';
    } else if (event === 'SIGNED_OUT') {
        window.location.href = 'login.html';
    }
});

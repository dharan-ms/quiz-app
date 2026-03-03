# 2) Feature List (MVP + Advanced)

## MVP (Priority P0/P1)
1. **Auth**
   - Signup/login/logout/me
   - Password hashing (bcrypt)
2. **Quiz Catalog**
   - List/search/filter by difficulty/category
   - Quiz detail page
3. **Attempt Flow + Timer**
   - Start/resume attempt
   - Whole-quiz timer with auto-submit
4. **Scoring + Review**
   - Auto scoring
   - Result page with explanations
5. **User History**
   - `/users/me/attempts`
6. **Basic Admin CRUD**
   - Quiz create/update/delete
   - Question create/update/delete

## Advanced (Priority P2+)
1. Randomization (question + option shuffle) ✅ implemented
2. Quiz scheduling (`availableFrom`, `availableTo`) ✅ implemented
3. Leaderboards (global + per quiz) ✅ implemented
4. Email verification & reset flow (reset token foundation) ⚠️ partial (email send integration pending)
5. Auth + global rate limiting ✅ implemented
6. Anti-cheat tab switch logging ✅ implemented
7. Admin analytics dashboard ✅ implemented
8. Question bank reuse ⚠️ planned (next iteration)
9. Multi-language support ⚠️ planned (next iteration)
